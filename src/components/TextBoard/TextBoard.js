import React, {useState, useRef, useEffect} from 'react';
import './TextBoard.css';
import {useEditor, EditorContent} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {FaPlus, FaEdit, FaTrash, FaEllipsisV, FaSignInAlt} from 'react-icons/fa';
import SlashCommand from '../../extensions/SlashCommand';
import {createNote, getNoteList, updateNote, deleteNote, getNoteShareUrl} from '../../api/NoteApi'
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {FloatingChatUI} from "../Chat";
import {getStoredUserId} from "../../Util/UserInfo";
import NoteMenuDropdown from './NoteMenuDropdown/NoteMenuDropdown';

// ==========================
// Main TextBoard Component
// ==========================
function TextBoard({project}) {
    const [notes, setNotes] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [editorContent, setEditorContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMenuId, setShowMenuId] = useState(null); // 어떤 노트의 메뉴가 열렸는지 관리
    const buttonRefs = useRef({}); // 각 노트별 버튼 ref 관리
    const [shareUrl, setShareUrl] = useState('');
    const socketRef = useRef(null);
    const [isShareEdit, setIsShareEdit] = useState(false);

    const handleJoinSharedNote = async () => {
        if (!shareUrl.trim()) return;
        try {
            const userId = getStoredUserId();  // 사용자 ID 불러오기
            const fullShareUrl = `${shareUrl}&requestUserId=${userId}`;  // ?token=xxx&userId=1 형태

            const socket = new WebSocket(fullShareUrl);

            if (socketRef.current) {
                console.log('기존 WebSocket 연결 종료 후 새로 연결합니다.');
                socketRef.current.close();
                socketRef.current = null;
            }

            socket.onopen = () => {
                console.log('WebSocket 연결 성공');

            };

            socket.onmessage = (event) => {
                const noteData = JSON.parse(event.data);

                if (modalOpen) {
                    // 모달 열려있으면 내용만 업데이트
                    setEditingNote(noteData);
                    if (editor) {
                        editor.commands.setContent(noteData.raw || "");
                        editor.chain().focus().run();
                    }
                } else {
                    // 모달 닫혀있으면 열기
                    openModalForEdit(noteData, noteData.isShareEdit);
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket 오류:', error);
            };

            socket.onclose = () => {
                console.log('WebSocket 연결 종료');
            };

            // 필요하면 socket을 상태나 ref에 저장해서 재사용 가능
        } catch (error) {
            console.error('WebSocket 연결 실패:', error);
        }
    };

    function copyNoteToClipboard(raw) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = raw;

        tempDiv.querySelectorAll("br, p, div, h1 ,h2").forEach(el => {
            el.insertAdjacentText("beforebegin", "\n");
        });

        const noteContent = tempDiv.innerText;

        navigator.clipboard.writeText(noteContent)
            .then(() => {
                alert("노트 내용이 복사되었습니다!");
            })
            .catch(err => {
                console.error("복사 실패:", err);
            });
    }

    const fetchNotes = async () => {
        if (!project || !project.id) {
            console.log('프로젝트 정보가 없습니다:', project);
            return;
        }

        setLoading(true);
        const shortProjectName = project.name.length > 5 ? `${project.name.substring(0, 5)}...` : project.name;

        try {
            setNotes([]);

            const storedUserId = getStoredUserId();
            const data = await getNoteList(storedUserId, project.id);

            if (data && data.length > 0) {
                setNotes(data);
                toast.success(`"${shortProjectName}"의 노트 ${data.length}개를 불러왔어요.`);
            } else {
                setNotes([]);
                toast.info(`"${shortProjectName}"에 노트가 없습니다.`);
            }
        } catch (error) {
            console.error('노트 로드 에러:', error);
            setNotes([]);
            toast.error('노트를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [project?.id, project?.name]);

    // 에디터 초기화
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: '여기에 내용을 입력해 주세요... "/" 입력시 명령어 메뉴가 나타납니다.',
                showOnlyWhenEditable: true,
                class: 'editor-placeholder',
            }),
            Link.configure({
                autolink: true,
                linkOnPaste: true,
                openOnClick: true,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            SlashCommand,
        ],
        content: editorContent,
        onUpdate: ({editor}) => {
            setEditorContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== editorContent) {
            editor.commands.setContent(editorContent);
        }
    }, [editorContent, editor]);

    const openModalForNew = () => {
        setEditorContent('');
        setEditingNote(null);
        setModalOpen(true);
        setTimeout(() => {
            if (editor) {
                editor.chain().focus().run();
            }
        }, 100);
    };

    const openModalForEdit = async (note, shareEdit = false) => {
        setEditingNote(note);
        setModalOpen(true);
        setIsShareEdit(shareEdit);


        try {
            if (editor) {
                editor.commands.setContent(note.raw || "");
                editor.chain().focus().run();
            }
        } catch (error) {
            console.error("메모 내용 불러오기 실패:", error);
            toast.error("메모 내용을 불러오는 중 오류가 발생했습니다.");
        }
    };

    const saveNote = async () => {
        if (isShareEdit) {
            toast.info("이 노트는 자동으로 저장됩니다. 작성자만 수정 내용을 최종 저장할 수 있습니다.");
            return
        }

        if (!editor) return;

        const htmlContent = editor.getHTML();

        if (!htmlContent || htmlContent.trim() === "") {
            alert('내용을 입력해주세요.');
            return;
        }

        const storedUserId = getStoredUserId();

        try {
            if (editingNote) {
                await updateNote(editingNote.id, storedUserId, htmlContent, project.id);
                toast.success('메모가 수정되었습니다.');
            } else {
                await createNote(storedUserId, htmlContent, project.id);
                toast.success('새 메모가 생성되었습니다.');
            }

            setModalOpen(false);
            setEditingNote(null);
            setEditorContent('');

            await fetchNotes();
        } catch (error) {
            console.error('메모 저장 에러:', error);
            toast.error('메모 저장 중 오류가 발생했습니다.');
        }
    };

    const deleteNoteHandler = async (id) => {
        if (!window.confirm('이 메모를 삭제하시겠습니까?')) return;

        try {
            const storedUserId = getStoredUserId();
            await deleteNote(storedUserId, id);
            setNotes(notes.filter(n => n.id !== id));
            toast.success('메모가 삭제되었습니다.');
        } catch (error) {
            console.error('메모 삭제 중 오류:', error);
            toast.error(`${error}`);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingNote(null);
        setEditorContent('');
    };

    // 메뉴 외부 클릭시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenuId && !Object.values(buttonRefs.current).some(ref =>
                ref && ref.contains && ref.contains(event.target)
            )) {
                setShowMenuId(null);
            }
        };

        if (showMenuId) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenuId]);

    // 메뉴 액션 처리 함수
    const handleMenuAction = async (action, noteId, noteData) => {
        console.log('메뉴 액션:', action, '노트ID:', noteId, '노트 데이터:', noteData);

        switch (action) {
            case 'share':
                console.log('공유 기능 실행');
                const shareUrl = await getNoteShareUrl(noteId);
                await navigator.clipboard.writeText(shareUrl.url);
                toast.success('공유 링크 복사됨 (Ctrl+V로 붙여넣기)');
                break;
            case 'edit':
                await openModalForEdit(noteData);
                console.log('편집 기능 실행');
                break;
            case 'copy':
                await copyNoteToClipboard(noteData.raw);
                console.log('복사 기능 실행');
                break;
            case 'download':
                console.log('다운로드 기능 실행');
                break;
            case 'delete':
                await deleteNoteHandler(noteId);
                console.log('삭제 기능 실행');
                break;
        }
    };

    if (!project || !project.id) {
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
            <div className="textboard-header">
                <div className="header-content">
                    {/* 왼쪽 프로젝트 정보 */}
                    <div className="project-info">
                        <h2 className="project-title">{project.name}</h2>
                        <span className="project-badge">프로젝트 계획</span>
                    </div>

                    {/* 중앙 공유 노트 섹션 */}
                    <div className="share-section">
                        <div className="share-input-wrapper">
                            <input
                                type="text"
                                className="share-input"
                                placeholder="공유 노트 URL을 입력하세요"
                                value={shareUrl}
                                onChange={(e) => setShareUrl(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleJoinSharedNote()}
                            />
                            <button
                                className="share-join-btn"
                                onClick={handleJoinSharedNote}
                                disabled={!shareUrl.trim() || loading}
                                title="공유 노트 참여"
                            >
                                <FaSignInAlt/>
                            </button>
                        </div>
                    </div>

                    {/* 오른쪽 새 메모 버튼 */}
                    <div className="header-actions">
                        <button
                            className="new-memo-btn"
                            onClick={openModalForNew}
                            disabled={loading}
                        >
                            <FaPlus className="btn-icon"/>
                            <span className="btn-text">
                    {loading ? '로딩중...' : '새 메모'}
                        </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 로딩 상태 */}
            {loading && (
                <div className="loading-state" style={{textAlign: 'center', padding: '40px'}}>
                    <p>노트를 불러오는 중...</p>
                </div>
            )}

            {/* 메모 리스트 */}
            {!loading && (
                <div className="notes-container-wrapper">
                    {notes.length === 0 ? (
                        <div className="empty-state">
                            <p>"{project.name}" 프로젝트에 메모가 없습니다.</p>
                            <p>새 메모를 작성해보세요!</p>
                        </div>
                    ) : (
                        notes.map(note => (
                            <div key={note.id} className="note-item">
                                {/* 헤더 영역 */}
                                <div className="note-header">
                                    <div className="note-icon">
                                        <svg width="20" height="20" viewBox="0 0 20 20"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <rect x="2" y="4" width="16" height="12" rx="2" fill="#ffffff"
                                                  opacity="0.95"/>
                                            <rect x="4" y="6" width="3" height="2" rx="0.5" fill="#0066ff"
                                                  opacity="0.8"/>
                                            <rect x="8.5" y="6" width="3" height="2" rx="0.5" fill="#0066ff"
                                                  opacity="0.6"/>
                                            <rect x="13" y="6" width="3" height="2" rx="0.5" fill="#0066ff"
                                                  opacity="0.8"/>
                                            <rect x="4" y="10" width="5" height="1" rx="0.5" fill="#0066ff" opacity="0.7"/>
                                            <rect x="10.5" y="10" width="4" height="1" rx="0.5" fill="#0066ff" opacity="0.5"/>
                                            <circle cx="15" cy="8" r="1.5" fill="#28a745"/>
                                            <path d="M14.3 8 L14.8 8.5 L15.7 7.6" stroke="#ffffff" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="note-menu-button">
                                        <button
                                            ref={el => buttonRefs.current[note.id] = el}
                                            onClick={() => {
                                                console.log(`메뉴 클릭됨: noteId=${note.id}`);
                                                setShowMenuId(showMenuId === note.id ? null : note.id);
                                            }}>
                                            <FaEllipsisV/>
                                        </button>

                                        {showMenuId === note.id && (
                                            <NoteMenuDropdown
                                                note={note}
                                                onClose={() => setShowMenuId(null)}
                                                onMenuClick={handleMenuAction}
                                                buttonRef={{current: buttonRefs.current[note.id]}}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* 제목 영역 */}
                                <div className="note-title">
                                    Preview
                                </div>

                                {/* 미리보기 내용 */}
                                <div
                                    className="note-preview"
                                    dangerouslySetInnerHTML={{__html: note.raw || note.content || ''}}
                                    onClick={() => openModalForEdit(note)}
                                />

                                {/* 하단 정보 영역 */}
                                <div className="note-info">
                                    <div className="note-meta">
                                        <span className="note-status">저장 공간</span>
                                    </div>
                                    <div className="note-progress">
                                        <span className="progress-text">{note.usedPercent}%</span>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{width: `${note.usedPercent}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* 기존 버튼들 (나중에 tags로 교체 예정) */}
                                <div className="note-buttons">
                                        <button
                                            className="edit-btn"
                                            onClick={() => openModalForEdit(note)}
                                        >
                                            <FaEdit/> 수정
                                        </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => deleteNoteHandler(note.id)}
                                    >
                                        <FaTrash/> 삭제
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* 모달 */}
            {editor && modalOpen && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h4>
                                {isShareEdit ? '공유 메모 작성' : (editingNote ? '메모 수정' : '새 메모 작성')}
                            </h4>

                            <small className='slash-hint'>
                                💡 타이핑 중에 <kbd>/</kbd>를 입력하여 빠른 명령을 실행하세요
                            </small>
                                {isShareEdit && (
                                <small className='auto-save-hint' style={{ display: 'block', marginTop: '4px', color: '#555' }}>
                                    🔄 공유 문서는 자동 저장됩니다.
                                </small>
                            )}
                        </div>

                        <div className="modal-editor-wrapper">
                        <EditorContent editor={editor} className="modal-editor"/>
                        </div>

                        <div className="modal-buttons">
                            {!isShareEdit && (
                                <button className="save-btn" onClick={saveNote}>
                                    저장
                                </button>
                            )}

                            <button className="cancel-btn" onClick={closeModal}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <FloatingChatUI project={project}/>
        </div>
    );
}

export default TextBoard;