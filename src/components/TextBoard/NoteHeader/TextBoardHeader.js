import React from 'react';
import {FaPlus, FaUser, FaUsers, FaCog} from 'react-icons/fa';
import ShareNoteSection from '../ShareNote/ShareNoteSection';
import "./TextBoardHeader.css";

const TextBoardHeader = ({
                             project,
                             onNewNote,
                             loading,
                             shareUrl,
                             setShareUrl,
                             onJoinSharedNote,
                             documentType = 'personal', // 'personal' | 'shared'
                             onDocumentTypeChange,
                         }) => {
    return (
        <div className="textboard-header-modern">
            <div className="header-grid">
                {/* 왼쪽 프로젝트 정보 */}
                <div className="project-section">
                    <div className="project-meta">
                        <h1 className="project-name">{project.name}</h1>
                        <span className="project-type">프로젝트</span>
                    </div>
                </div>

                {/* 중앙 문서 타입 스위처 */}
                <div className="document-switcher">
                    <div className="switcher-track">
                        <button
                            className={`switcher-option ${documentType === 'personal' ? 'active' : ''}`}
                            onClick={() => onDocumentTypeChange('personal')}
                        >
                            <FaUser />
                            나의 문서
                        </button>
                        <button
                            className={`switcher-option ${documentType === 'shared' ? 'active' : ''}`}
                            onClick={() => onDocumentTypeChange('shared')}
                        >
                            <FaUsers />
                            공유 문서
                        </button>
                    </div>
                </div>

                {/* 오른쪽 액션 영역 */}
                <div className="actions-section">
                    {/* 참가자 표시 - 공유 중일 때만 보이기 */}

                    <button className="action-btn secondary" title="설정">
                        <FaCog />
                    </button>
                    <button
                        className="action-btn primary"
                        onClick={onNewNote}
                        disabled={loading}
                    >
                        <FaPlus />
                        새 메모
                    </button>
                </div>
            </div>

            {/* 공유 문서 입력창 */}
            {documentType === 'shared' && (
                <div className="share-input-section">
                    <ShareNoteSection
                        shareUrl={shareUrl}
                        setShareUrl={setShareUrl}
                        onJoinSharedNote={onJoinSharedNote}
                        loading={loading}
                    />
                </div>
            )}
        </div>
    );
};

export default TextBoardHeader;