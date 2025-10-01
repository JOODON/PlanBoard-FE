import React, { useState, useRef, useCallback } from 'react';
import './TextBoard.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FloatingChatUI } from "../Chat";
import { getStoredUserId } from "../../Util/UserInfo";

// 분리된 컴포넌트들 import
import TextBoardHeader from './NoteHeader/TextBoardHeader';
import NoteList from './NoteList/NoteList';
import NoteModal from './NoteModal/NodtModal';

// 커스텀 훅들 import
import { useNotes } from './UseNote/useNotes';
import { useTextEditor } from './NoteTextEditor/useEditor.js';

// 유틸 함수들 import
import { copyNoteToClipboard } from '../../Util/NoteUtils.js';
import TagManagementModal from './NoteMenuDropdown/TagManagementModal'
import './CursorAnimation.css'
import ImageOCRUpload from './Ocr/ImageOCRUpload';

function TextBoard({ project }) {
    // 상태 관리
    const [modalOpen, setModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [shareUrl, setShareUrl] = useState('');
    const [isShareEdit, setIsShareEdit] = useState(false);
    const socketRef = useRef(null);
    const [documentType, setDocumentType] = useState('personal');
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [tagEditingNoteId, setTagEditingNoteId] = useState(null);
    const [otherCursors, setOtherCursors] = useState({});
    const [participants, setParticipants] = useState([]); //현재 노트에 참가한 사용자
    const [isSharing, setIsSharing] = useState(false);
    const [userColors, setUserColors] = useState({}); // 사용자별 색상 저장

    const [showOCRUpload, setShowOCRUpload] = useState(null)

    // 디바운스를 위한 타이머 ref 추가
    const updateTimerRef = useRef(null);
    const lastUpdateRef = useRef(''); // 마지막 업데이트 내용 추적
    const editingNoteRef = useRef(null); // editingNote의 최신 값을 추적

    let cursorInterval = null;

    // 커스텀 훅 사용
    const {
        notes,
        loading,
        createNewNote,
        updateExistingNote,
        deleteNoteById,
        shareNote,
        updateTags,
        deleteShareNote
    } = useNotes(project, documentType);

    const ocrHandler = async () => {
        setShowOCRUpload(prev => !prev);
    }

    const {
        editor,
        clearContent,
        focusEditor
    } = useTextEditor({
        onOCRTrigger: ocrHandler
    });

    const handleDocumentTypeChange = (type) => {
        setDocumentType(type);
    };

    // 사용자별 고유 색상 생성 함수
    const getUserColor = (userId) => {
        if (userColors[userId]) return userColors[userId];

        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        const color = `hsl(${hue}, 65%, 60%)`;

        setUserColors(prev => ({ ...prev, [userId]: color }));
        return color;
    };

    // 디바운스된 노트 업데이트 함수
    const sendNoteUpdateDebounced = useCallback((content) => {
        const currentEditingNote = editingNoteRef.current; // ref에서 최신 값 가져오기

        console.log('sendNoteUpdateDebounced 호출:', {
            content: content?.substring(0, 50),
            lastUpdate: lastUpdateRef.current?.substring(0, 50),
            isEqual: lastUpdateRef.current === content,
            editingNote: editingNote, // state 값
            editingNoteRef: currentEditingNote, // ref 값 (최신)
            editingNoteId: currentEditingNote?.id
        });

        // 내용이 변경되지 않았으면 전송하지 않음
        if (lastUpdateRef.current === content) {
            console.log('내용 동일하여 업데이트 스킵');
            return;
        }

        // editingNote가 없으면 업데이트할 수 없음
        if (!currentEditingNote) {
            console.error('editingNote가 null이므로 업데이트 불가');
            return;
        }

        // 기존 타이머가 있으면 취소
        if (updateTimerRef.current) {
            console.log('기존 타이머 취소');
            clearTimeout(updateTimerRef.current);
        }

        updateTimerRef.current = setTimeout(() => {
            const latestEditingNote = editingNoteRef.current; // 타이머 실행 시점의 최신 값

            console.log('타이머 실행 - 업데이트 전송 시도:', {
                socketState: socketRef.current?.readyState,
                hasEditingNote: !!latestEditingNote,
                noteId: latestEditingNote?.id
            });

            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && latestEditingNote) {
                const updateData = {
                    type: 'update-note',
                    noteId: latestEditingNote.id,
                    raw: content,
                    userId: getStoredUserId()
                };

                console.log('WebSocket으로 데이터 전송:', updateData);
                socketRef.current.send(JSON.stringify(updateData));
                lastUpdateRef.current = content;
                console.log('노트 업데이트 전송 완료:', content.substring(0, 50) + '...');
            } else {
                console.error('업데이트 전송 실패:', {
                    socketExists: !!socketRef.current,
                    socketState: socketRef.current?.readyState,
                    wsOpenState: WebSocket.OPEN,
                    hasEditingNote: !!latestEditingNote,
                    editingNoteValue: latestEditingNote
                });
            }
        }, 1000);
    }, []); // 의존성 배열에서 editingNote 제거

    // 즉시 노트 업데이트 함수 (기존 함수 유지)
    const sendNoteUpdate = (content) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && editingNote) {
            socketRef.current.send(JSON.stringify({
                type: 'update-note',
                noteId: editingNote.id,
                raw: content,
                userId: getStoredUserId()
            }));
            lastUpdateRef.current = content;
        }
    };

    // 에디터 내용 변경 핸들러 추가
    const handleEditorUpdate = useCallback((content) => {
        console.log('handleEditorUpdate 호출됨:', {
            isSharing,
            editingNote: editingNote?.id,
            contentLength: content?.length,
            content: content?.substring(0, 100)
        });

        if (isSharing && editingNote) {
            console.log('디바운스 업데이트 함수 호출');
            sendNoteUpdateDebounced(content);
        } else {
            console.log('업데이트 조건 불만족:', { isSharing, hasEditingNote: !!editingNote });
        }
    }, [isSharing, editingNote, sendNoteUpdateDebounced]);

    // 즉시 업데이트가 필요한 경우들
    const handlePasteContent = useCallback((content) => {
        if (isSharing && editingNote) {
            sendNoteUpdate(content); // 붙여넣기는 즉시 전송
        }
    }, [isSharing, editingNote]);

    const handleImageInsert = useCallback((content) => {
        if (isSharing && editingNote) {
            sendNoteUpdate(content); // 이미지 삽입은 즉시 전송
        }
    }, [isSharing, editingNote]);

    const handleTableInsert = useCallback((content) => {
        if (isSharing && editingNote) {
            sendNoteUpdate(content); // 테이블 삽입은 즉시 전송
        }
    }, [isSharing, editingNote]);

    //커서 위치 가지고오기
    const getCursorPosition = () => {
        if (!editor) return null;
        const { from, to } = editor.state.selection;
        if (from !== to) return null; // 선택 영역이면 null
        return {
            userId: getStoredUserId(),
            cursorPosition: from,
        };
    };

    //주기적으로 나의 위치 커서로 보내기
    const startSendingCursor = () => {
        if (!socketRef.current) return;

        if (cursorInterval) clearInterval(cursorInterval); // 기존 interval 제거

        cursorInterval = setInterval(() => {
            const cursorData = getCursorPosition();
            if (!cursorData) return;

            if (socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    type: 'cursor-update',
                    ...cursorData
                }));
            }
        }, 5000); // 5초마다 전송 (더 빠른 업데이트)
    };

    // updateOtherCursors 함수 - 깔끔하게 정리
    const updateOtherCursors = (data) => {
        const {userId, cursorPosition, username} = data;

        if (userId === getStoredUserId()) return; // 자기 자신은 제외

        // 기존 해당 사용자의 커서 제거
        const existingCursors = document.querySelectorAll(`.cursor-${userId}`);
        existingCursors.forEach(el => el.remove());

        if (!editor?.view?.dom || cursorPosition == null) return;

        try {
            // 커서 위치가 문서 범위를 벗어나면 조정
            const maxPos = editor.state.doc.content.size;
            const safePos = Math.min(cursorPosition, maxPos);

            // 해당 위치의 좌표 계산
            const coords = editor.view.coordsAtPos(safePos);
            if (!coords) return;

            const editorRect = editor.view.dom.getBoundingClientRect();

            // 사용자 정보 가져오기
            const participant = participants.find(p => p.userId === userId) || {username : '익명 사용자'};
            const displayName = participant.username.length >= 2 ? participant.username.substring(0, 2) : participant.username;
            const color = getUserColor(userId);

            // 커서 컨테이너 생성
            const cursorContainer = document.createElement('div');
            cursorContainer.className = `collaboration-cursor cursor-${userId}`;
            cursorContainer.style.left = `${coords.left - editorRect.left}px`;
            cursorContainer.style.top = `${coords.top - editorRect.top}px`;

            // 깜빡이는 커서 라인
            const cursorLine = document.createElement('div');
            cursorLine.className = 'collaboration-cursor-line';
            cursorLine.style.backgroundColor = color;

            // 아바타
            const avatar = document.createElement('div');
            avatar.className = 'collaboration-cursor-avatar';
            avatar.textContent = displayName;
            avatar.style.backgroundColor = color;

            // 조립
            cursorContainer.appendChild(cursorLine);
            cursorContainer.appendChild(avatar);

            // 에디터 컨테이너에 추가
            const container = editor.view.dom.parentElement || editor.view.dom;
            container.style.position = 'relative';
            container.appendChild(cursorContainer);

            // 3초 후 자동 제거
            setTimeout(() => {
                if (cursorContainer.parentNode) {
                    cursorContainer.remove();
                }
            }, 3000);

        } catch (error) {
            console.warn('커서 아바타 생성 실패:', error);
        }
    };

    // WebSocket 관련 함수
    const handleJoinSharedNote = async (urlOrEvent = null) => {
        // 이벤트 객체인지 확인하는 더 안전한 방법
        const isEvent = urlOrEvent && typeof urlOrEvent === 'object' && (urlOrEvent._reactName || urlOrEvent.nativeEvent);

        const url = isEvent ? null : urlOrEvent;
        const targetUrl = url || shareUrl;

        try {
            const userId = getStoredUserId();
            const fullShareUrl = `${targetUrl}&requestUserId=${userId}&projectId=${project.id}`;

            // 기존 WebSocket 연결이 있으면 종료
            if (socketRef.current) {
                console.log('기존 WebSocket 연결 종료 후 새로 연결합니다.');
                socketRef.current.close();
                socketRef.current = null;
            }

            // 새로운 WebSocket 연결 생성
            const socket = new WebSocket(fullShareUrl);
            socketRef.current = socket; // ref에 저장

            // 연결 성공 시
            socket.onopen = () => {
                console.log('WebSocket 연결 성공');
                startSendingCursor(); // 커서 전송 시작
            };

            // 메시지 수신 시
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'participants-update') {
                    setParticipants(data.participants || []);
                    return;
                }

                if (data.type === 'is-open') {
                    // console.log('is-open 메시지 받음:', data);
                    setIsSharing(true);
                    setParticipants(data.participants || []);
                    setIsShareEdit(data.isShareEdit);
                    setEditingNote(data);
                    editingNoteRef.current = data; // ref에도 설정

                    if (modalOpen) {
                        console.log('모달이 이미 열려있음 - 내용 업데이트');
                        if (editor) {
                            editor.commands.setContent(data.raw || "");
                            editor.chain().focus().run();
                            lastUpdateRef.current = data.raw || ''; // 초기 내용 설정
                        }
                    } else {
                        openModalForEdit(data, data.isShareEdit, true);
                    }
                    return;
                }

                // if (data.type === 'update-note') {
                //     console.log("2. [DEBUG] update-note 데이터 수신");
                //
                //     // 자신이 보낸 업데이트는 무시
                //     if (data.userId === getStoredUserId()) return;
                //
                //     // ref에서 최신 editingNote 값 가져오기
                //     const currentEditingNote = editingNoteRef.current;
                //
                //     console.log('update-note 처리:', {
                //         receivedNoteId: data.noteId,
                //         currentEditingNoteId: currentEditingNote?.id,
                //         hasEditor: !!editor,
                //         currentEditingNote: currentEditingNote
                //     });
                //
                //     if (currentEditingNote && currentEditingNote.id === data.noteId && editor) {
                //         // 내용 업데이트
                //         editor.commands.setContent(data.raw);
                //
                //         // state와 ref 모두 업데이트
                //         const updatedNote = {
                //             ...currentEditingNote,
                //             raw: data.raw,
                //             content: data.raw
                //         };
                //
                //         setEditingNote(updatedNote);
                //         editingNoteRef.current = updatedNote;
                //
                //         // 마지막 업데이트 내용 갱신
                //         lastUpdateRef.current = data.raw;
                //
                //         console.log('다른 사용자의 노트 업데이트 받음');
                //     } else {
                //         console.warn('update-note 처리 실패:', {
                //             hasCurrentEditingNote: !!currentEditingNote,
                //             noteIdMatch: currentEditingNote?.id === data.noteId,
                //             hasEditor: !!editor
                //         });
                //     }
                //     return;
                // }
                if (data.type === 'update-note') {
                    console.log("2. [DEBUG] update-note 데이터 수신");

                    // 자신이 보낸 업데이트는 무시
                    if (data.userId === getStoredUserId()) return;

                    // ref에서 최신 editingNote 값 가져오기
                    const currentEditingNote = editingNoteRef.current;

                    console.log('update-note 처리:', {
                        receivedNoteId: data.noteId,
                        currentEditingNoteId: currentEditingNote?.id,
                        hasEditor: !!editor,
                        currentEditingNote: currentEditingNote
                    });

                    if (currentEditingNote && currentEditingNote.id === data.noteId && editor) {
                        // 🔥 현재 커서 위치 저장
                        const currentSelection = editor.state.selection;
                        const { from, to } = currentSelection;

                        console.log('커서 위치 저장:', { from, to });

                        // 내용 업데이트
                        editor.commands.setContent(data.raw);

                        // 🔥 커서 위치 복원 (문서 길이를 넘지 않도록 체크)
                        const newDocSize = editor.state.doc.content.size;
                        const safeFrom = Math.min(from, newDocSize);
                        const safeTo = Math.min(to, newDocSize);

                        editor.commands.setTextSelection({ from: safeFrom, to: safeTo });

                        console.log('커서 위치 복원:', { safeFrom, safeTo, newDocSize });

                        // state와 ref 모두 업데이트
                        const updatedNote = {
                            ...currentEditingNote,
                            raw: data.raw,
                            content: data.raw
                        };

                        setEditingNote(updatedNote);
                        editingNoteRef.current = updatedNote;

                        // 마지막 업데이트 내용 갱신
                        lastUpdateRef.current = data.raw;

                        console.log('다른 사용자의 노트 업데이트 받음 - 커서 위치 유지');
                    } else {
                        console.warn('update-note 처리 실패:', {
                            hasCurrentEditingNote: !!currentEditingNote,
                            noteIdMatch: currentEditingNote?.id === data.noteId,
                            hasEditor: !!editor
                        });
                    }
                    return;
                }

                if (data.type === 'cursor-update') {
                    console.log("커서 포인터 실행", data);
                    updateOtherCursors(data);
                    return;
                }
            };

            // 에러 발생 시
            socket.onerror = (error) => {
                console.error('WebSocket 오류:', error);
                toast.error('실시간 협업 연결에 문제가 발생했습니다.');
                if (cursorInterval) clearInterval(cursorInterval);
            };

            // 연결 종료 시
            socket.onclose = () => {
                console.log('WebSocket 연결 종료');
                setIsSharing(false);
                setParticipants([]);
                setOtherCursors({});
                if (cursorInterval) clearInterval(cursorInterval);
                if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
            };

        } catch (error) {
            console.error('WebSocket 연결 실패:', error);
            toast.error('공유 노트 연결에 실패했습니다.');
            if (cursorInterval) clearInterval(cursorInterval);
        }
    };

    // 모달 관련 함수들
    const openModalForNew = () => {
        clearContent();
        setEditingNote(null);
        setIsShareEdit(false);
        setModalOpen(true);
        focusEditor();
        lastUpdateRef.current = ''; // 초기화
    };

    const openModalForEdit = async (note, shareEdit = false, fromWebSocket = false) => {
        //진입시 Doc 타입 체크
        if (documentType === 'shared' && !fromWebSocket) {
            setShareUrl(note.connUrl);
            await handleJoinSharedNote(note.connUrl);
            return;
        }

        setEditingNote(note); //현재 편집중인 노트
        editingNoteRef.current = note; // ref에도 동시에 설정
        setIsShareEdit(shareEdit);     //편집중인 ShareEdit
        setModalOpen(true);

        try {
            if (editor) {
                //초기 진입시
                editor.commands.setContent(note.raw || "");
                editor.chain().focus().run();
                lastUpdateRef.current = note.raw || ''; // 초기 내용 설정
            } else {
                // 에디터가 아직 준비되지 않은 경우 - 잠시 후 다시 시도
                console.log('에디터가 아직 준비되지 않음 - 100ms 후 재시도');
                setTimeout(() => {
                    if (editor) {
                        editor.commands.setContent(note.raw || "");
                        editor.chain().focus().run();
                        lastUpdateRef.current = note.raw || '';
                    }
                }, 100);
            }
        } catch (error) {
            console.error("메모 내용 불러오기 실패:", error);
            toast.error("메모 내용을 불러오는 중 오류가 발생했습니다.");
        }
    };

    const saveNote = async () => {
        if (isShareEdit) {
            // 공유 편집 모드에서는 최종 저장만 가능
            if (!editor) return;

            const htmlContent = editor.getHTML();

            try {
                // 최종 저장 전송
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({
                        type: 'final-save',
                        noteId: editingNote.id,
                        raw: htmlContent,
                        userId: getStoredUserId()
                    }));
                }

                toast.success("노트가 저장되었습니다.");
                closeModal();
            } catch (error) {
                console.error('공유 노트 저장 에러:', error);
                toast.error('노트 저장 중 오류가 발생했습니다.');
            }
            return;
        }

        if (!editor) return;

        const htmlContent = editor.getHTML();

        if (!htmlContent || htmlContent.trim() === "" || htmlContent === '<p></p>') {
            alert('내용을 입력해주세요.');
            return;
        }

        try {
            if (editingNote) {
                await updateExistingNote(editingNote.id, htmlContent);
            } else {
                await createNewNote(htmlContent);
            }

            closeModal();
        } catch (error) {
            console.error('메모 저장 에러:', error);
            toast.error('메모 저장 중 오류가 발생했습니다.');
        }
    };

    //노트 모달 닫기
    const closeModal = () => {
        setModalOpen(false);
        setTagEditingNoteId(null);
        setEditingNote(null);
        editingNoteRef.current = null; // ref도 초기화
        setIsShareEdit(false);

        // 타이머들 정리
        if (cursorInterval) {
            clearInterval(cursorInterval);
            cursorInterval = null;
        }

        if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current);
            updateTimerRef.current = null;
        }

        // 소켓 종료
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        // 상태 초기화
        setOtherCursors({});
        setIsSharing(false);
        setParticipants([]);
        lastUpdateRef.current = '';

        clearContent();
    };

    // 컴포넌트 언마운트 시 정리
    React.useEffect(() => {
        return () => {
            if (cursorInterval) clearInterval(cursorInterval);
            if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    // 태그 모달 관련 함수들
    const openTagModal = (noteId, note) => {
        setEditingNote(note);
        setTagEditingNoteId(noteId);
        setTagModalOpen(true);
    };

    const closeTagModal = () => {
        setTagModalOpen(false);
        setTagEditingNoteId(null);
        setEditingNote(null);
        if (cursorInterval) clearInterval(cursorInterval);
    };

    const handleSaveTags = async (newTags) => {
        try {
            // API 호출해서 태그 업데이트
            await updateTags(tagEditingNoteId, newTags);
            toast.success('태그가 업데이트되었습니다.');
            closeTagModal();
        } catch (error) {
            console.error('태그 업데이트 에러:', error);
            toast.error('태그 업데이트 중 오류가 발생했습니다.');
        }
    };

    const handleOCRComplete = (extractedText) => {
        setShowOCRUpload(false);

        if (!editor) {
            toast.error('에디터를 찾을 수 없습니다.');
            return;
        }

        editor
            .chain()
            .focus('end')  // 문서 끝으로 이동
            .insertContent('<p></p>')  // 빈 줄 추가
            .insertContent(extractedText)  // OCR 텍스트 삽입
            .run();

        toast.success('텍스트가 추출되어 노트에 삽입되었습니다!');
    };

    // 메뉴 액션 처리 함수
    const handleMenuAction = async (action, noteId, noteData) => {
        switch (action) {
            case 'share':
                await shareNote(noteId, project.id);
                break;
            case 'tag':
                await openTagModal(noteId, noteData);
                break;
            case 'edit':
                await openModalForEdit(noteData);
                break;
            case 'copy':
                await copyNoteToClipboard(noteData.raw);
                break;
            case 'download':
                console.log('다운로드 기능 실행');
                // TODO: 다운로드 기능 구현
                break;
            case 'delete':
                await deleteNoteById(noteId);
                break;
            case "delete-shared":
                if (noteData.shareId){
                    await deleteShareNote(noteData.shareId)
                }
                break;
            // 여기서부터는 Share 기능
        }
    };

    // 프로젝트가 없는 경우 처리
    if (!project?.id) {
        return (
            <div className="textboard-wrapper">
                <div className="empty-state">
                    <p>프로젝트를 선택해주세요.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="textboard-wrapper">
            <div className="textboard-container">

                {/* 헤더 */}
                <TextBoardHeader
                    project={project}
                    onNewNote={openModalForNew}
                    loading={loading}
                    shareUrl={shareUrl}
                    setShareUrl={setShareUrl}
                    onJoinSharedNote={handleJoinSharedNote}
                    documentType={documentType}
                    onDocumentTypeChange={handleDocumentTypeChange}
                />

                {/* 노트 리스트 */}
                <NoteList
                    notes={notes}
                    project={project}
                    loading={loading}
                    onEditNote={openModalForEdit}
                    onMenuAction={handleMenuAction}
                    documentType={documentType}
                />

                {/* 모달 */}
                <NoteModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    onSave={saveNote}
                    editor={editor}
                    editingNote={editingNote}
                    isShareEdit={isShareEdit}
                    participants={participants}
                    isSharing={isSharing}
                    currentUserId={getStoredUserId()}
                    onEditorUpdate={handleEditorUpdate}
                    onPasteContent={handlePasteContent}
                />

                {/* 태그 관리 모달 */}
                {editingNote && (
                    <TagManagementModal
                        isOpen={tagModalOpen}
                        onClose={closeTagModal}
                        tags={editingNote.tags || []}
                        onSave={handleSaveTags}
                    />
                )}

                {/*이미지 TExt 변환 모달*/}
                {showOCRUpload && (
                    <ImageOCRUpload
                        onOCRComplete={handleOCRComplete}
                        onClose={() => setShowOCRUpload(false)}
                        editor={editor}
                    />
                )}
                {/* 플로팅 채팅 */}
                <FloatingChatUI project={project} />
            </div>
        </div>
    );
}

export default TextBoard;