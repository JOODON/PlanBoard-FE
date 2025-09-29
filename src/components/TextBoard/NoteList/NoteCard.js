import React, { useRef, useState, useEffect } from 'react';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import NoteMenuDropdown from '../NoteMenuDropdown/NoteMenuDropdown';
import './NoteCard.css'
const NoteCard = ({ note, onEdit, onMenuAction , documentType}) => {
    const [showMenu, setShowMenu] = useState(false);
    const buttonRef = useRef(null);

    // 메뉴 외부 클릭시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && buttonRef.current && !buttonRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleMenuAction = async (action) => {
        setShowMenu(false);
        await onMenuAction(action, note.id, note);
    };

    return (
        <div className="note-item">
            {/* 헤더 영역 */}
            <div className="note-header">
                <div className="note-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="16" height="12" rx="2" fill="#ffffff" opacity="0.95"/>
                        <rect x="4" y="6" width="3" height="2" rx="0.5" fill="#0066ff" opacity="0.8"/>
                        <rect x="8.5" y="6" width="3" height="2" rx="0.5" fill="#0066ff" opacity="0.6"/>
                        <rect x="13" y="6" width="3" height="2" rx="0.5" fill="#0066ff" opacity="0.8"/>
                        <rect x="4" y="10" width="5" height="1" rx="0.5" fill="#0066ff" opacity="0.7"/>
                        <rect x="10.5" y="10" width="4" height="1" rx="0.5" fill="#0066ff" opacity="0.5"/>
                        <circle cx="15" cy="8" r="1.5" fill="#28a745"/>
                        <path d="M14.3 8 L14.8 8.5 L15.7 7.6" stroke="#ffffff" strokeWidth="0.6"
                              fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="note-menu-button">
                    <button
                        ref={buttonRef}
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <FaEllipsisV/>
                    </button>

                    {showMenu && (
                        <NoteMenuDropdown
                            note={note}
                            onClose={() => setShowMenu(false)}
                            onMenuClick={handleMenuAction}
                            buttonRef={buttonRef}
                            documentType={documentType}
                        />
                    )}
                </div>
            </div>

            {/* 제목 영역 */}
            <div className="note-title"></div>

            {/* 미리보기 내용 */}
            <div
                className="note-preview"
                dangerouslySetInnerHTML={{__html: note.raw || note.content || ''}}
                onClick={() => onEdit(note)}
            />
            <div className="note-tags">
                {note.tags && note.tags.length > 0 ? (
                    note.tags.map((tag, index) => (
                        <span key={index} className="note-tag">
                    #{tag}
                </span>
                    ))
                ) : (
                    <span className="note-tag-placeholder">#태그없음</span>
                )}
            </div>
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

        </div>
    );
};

export default NoteCard;