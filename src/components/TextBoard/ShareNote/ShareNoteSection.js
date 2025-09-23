import React from 'react';
import { FaSignInAlt } from 'react-icons/fa';
import "./ShareNoteSection.css"

const ShareNoteSection = ({ shareUrl, setShareUrl, onJoinSharedNote, loading }) => {
    return (
        <div className="share-section">
            <div className="share-input-wrapper">
                <input
                    type="text"
                    className="share-input"
                    placeholder="공유 노트 URL을 입력하세요"
                    value={shareUrl}
                    onChange={(e) => setShareUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onJoinSharedNote()}
                />
                <button
                    className="share-join-btn"
                    onClick={onJoinSharedNote}
                    disabled={!shareUrl.trim() || loading}
                    title="공유 노트 참여"
                >
                    <FaSignInAlt />
                </button>
            </div>
        </div>
    );
};

export default ShareNoteSection;