import React, { useState } from 'react';
import { Plus, Calendar, FileText } from 'lucide-react';
import { createProject } from '../../api/ProjectApi';
import { toast } from "react-toastify";
import './Header.css';

const Header = ({ projects, setProjects, user, currentView, setCurrentView }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [deadline, setDeadline] = useState('');


    const handleCreateProject = async () => {
        if (!projectName.trim()) {
            toast.warn("프로젝트 이름을 입력해주세요!");
            return;
        }

        try {
            const newProject = await createProject({
                name: projectName,
                start: startDate,
                deadline: deadline,
                userId: user.id
            });

            setProjects((prev) => [...prev, newProject]);
            setProjectName('');
            setStartDate('');
            setDeadline('');
            setShowCreateModal(false);
            toast.success("새 계획이 생성되었습니다!");
        } catch (error) {
            console.error("프로젝트 생성 실패:", error);
            toast.error("계획 생성에 실패했습니다.");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCreateProject();
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setProjectName('');
        setStartDate('');
        setDeadline('');
    };

    return (
        <>
            <div className="header">
                {/* 좌측: 로고 */}
                {/*<div className="header-logo" onClick={handleLogoClick}>*/}
                {/*    <PlanBoardLogo width={140} height={42} />*/}
                {/*</div>*/}

                {/* 중앙: 뷰 전환 탭 */}
                <div className="view-tabs">
                    <button
                        onClick={() => setCurrentView('calendar')}
                        className={`view-tab ${currentView === 'calendar' ? 'active' : ''}`}
                    >
                        <Calendar size={16} />
                        캘린더
                    </button>
                    <button
                        onClick={() => setCurrentView('memo')}
                        className={`view-tab ${currentView === 'memo' ? 'active' : ''}`}
                    >
                        <FileText size={16} />
                        메모
                    </button>
                </div>

                {/* 우측: 프로젝트 수 + 새 프로젝트 버튼 */}
                <div className="header-right">
                    <div className="project-count">
                        총 {projects.length}개의 프로젝트
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="new-project-btn"
                    >
                        <Plus size={16} />
                        새로운 계획
                    </button>
                </div>
            </div>

            {/* 프로젝트 생성 모달 */}
            {showCreateModal && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div
                        className="modal project-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="project-modal-header">
                            <h3 className="project-modal-title">
                                새로운 계획 만들기
                            </h3>
                        </div>

                        <div className="project-modal-body">
                            <div className="form-group">
                                <label className="form-label">
                                    계획 이름
                                </label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="계획 이름을 입력하세요"
                                    className="form-input"
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    시작 날짜
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    마감 날짜
                                </label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    min={startDate}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="project-modal-footer">
                            <button
                                onClick={closeModal}
                                className="modal-cancel-btn"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateProject}
                                className="modal-create-btn"
                                disabled={!projectName.trim()}
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;