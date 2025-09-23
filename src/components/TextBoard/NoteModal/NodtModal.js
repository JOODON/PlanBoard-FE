import React, { useEffect } from 'react';
import { EditorContent } from '@tiptap/react';
import ParticipantsDisplay from './ParticipantsDisplay'
import './ParticipantsDisplay.css'

const NoteModal = ({
                       isOpen,
                       onClose,
                       onSave,
                       editor,
                       editingNote,
                       isShareEdit,
                       isSharing,
                       participants,
                       currentUserId,
                       onEditorUpdate,
                       onPasteContent
                   }) => {

    // 에디터 이벤트 리스너 등록
    useEffect(() => {
        if (!editor || !isOpen) return;

        console.log('NoteModal - 에디터 이벤트 등록 시도:', {
            hasEditor: !!editor,
            isOpen,
            isSharing,
            isShareEdit,
            hasOnEditorUpdate: !!onEditorUpdate
        });

        // 공유 모드이거나 공유 편집 모드일 때만 이벤트 등록
        if ((isSharing || isShareEdit) && onEditorUpdate) {
            console.log('NoteModal - 에디터 이벤트 리스너 등록');

            // 일반적인 텍스트 변경 이벤트
            const handleUpdate = ({ editor: updatedEditor }) => {
                const content = updatedEditor.getHTML();
                console.log('NoteModal - 에디터 update 이벤트:', content.substring(0, 50));
                onEditorUpdate(content);
            };

            // 붙여넣기 이벤트
            const handlePaste = ({ editor: updatedEditor }) => {
                setTimeout(() => {
                    const content = updatedEditor.getHTML();
                    console.log('NoteModal - 에디터 paste 이벤트');
                    if (onPasteContent) {
                        onPasteContent(content);
                    } else {
                        onEditorUpdate(content);
                    }
                }, 100); // paste 처리 완료 후
            };

            // 이벤트 리스너 등록
            editor.on('update', handleUpdate);
            editor.on('paste', handlePaste);

            // 클린업 함수
            return () => {
                console.log('NoteModal - 에디터 이벤트 리스너 제거');
                editor.off('update', handleUpdate);
                editor.off('paste', handlePaste);
            };
        }
    }, [editor, isOpen, isSharing, isShareEdit, onEditorUpdate, onPasteContent]);

    if (!isOpen || !editor) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="modal-title-section">
                        <h4>
                            {isShareEdit ? '공유 메모 작성' : (editingNote ? '메모 수정' : '새 메모 작성')}
                        </h4>
                        <ParticipantsDisplay
                            isSharing={isSharing}
                            participants={participants}
                            currentUserId={currentUserId}
                        />
                    </div>
                    <small className='slash-hint'>
                        💡 타이핑 중에 <kbd>/</kbd>를 입력하여 빠른 명령을 실행하세요
                    </small>

                    {isShareEdit && (
                        <small className='auto-save-hint' style={{
                            display: 'block',
                            marginTop: '4px',
                            color: '#555'
                        }}>
                            🔄 공유 문서는 자동 저장됩니다.
                        </small>
                    )}
                </div>

                <div className="modal-editor-wrapper">
                    <EditorContent editor={editor} className="modal-editor" />
                </div>

                <div className="modal-buttons">
                    {!isShareEdit && (
                        <button className="save-btn" onClick={onSave}>
                            저장
                        </button>
                    )}
                    <button className="cancel-btn" onClick={onClose}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;