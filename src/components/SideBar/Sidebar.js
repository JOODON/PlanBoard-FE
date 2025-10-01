import React, { useState } from 'react';
import { User, Settings, Edit3, Trash2, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import {updateProject, deleteProject, createProject} from '../../api/ProjectApi';
import { toast } from "react-toastify";
import './Sidebar.css';
import {getStoredUserId, removeStoredUserId} from "../../Util/UserInfo";

const Sidebar = ({
                     className,
                     user,
                     showUserInfo,
                     setShowUserInfo,
                     projects,
                     setSelectedProject,
                     onEditProject,
                     onDeleteProject,
                     setProjects
                 }) => {
    const [editingProject, setEditingProject] = useState(null);
    const [editName, setEditName] = useState('');
    const [expandedProjects, setExpandedProjects] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleEditProject = async (projectId) => {
        if (!editName.trim()) {
            toast.warn("프로젝트 이름을 입력해주세요!");
            return;
        }

        try {
            await updateProject(projectId, { name: editName });
            onEditProject(projectId, { name: editName });
            setEditingProject(null);
            toast.success("프로젝트명이 변경되었습니다!");
        } catch (error) {
            console.error("프로젝트 수정 실패:", error);
            toast.error("프로젝트 수정에 실패했습니다.");
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
            return;
        }

        try {
            await deleteProject(projectId);
            onDeleteProject(projectId);
            toast.success("프로젝트가 삭제되었습니다.");
        } catch (error) {
            console.error("프로젝트 삭제 실패:", error);
            toast.error("프로젝트 삭제에 실패했습니다.");
        }
    };

    const startEdit = (project, e) => {
        e.stopPropagation();
        setEditingProject(project.id);
        setEditName(project.name);
    };

    const cancelEdit = () => {
        setEditingProject(null);
        setEditName('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleEditProject(editingProject);
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

    const handleDeleteClick = (projectId, e) => {
        e.stopPropagation();
        handleDeleteProject(projectId);
    };

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

    const handleAddKeyPress = (e) => {
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

    const handleLogout = () => {
        removeStoredUserId()
        window.location.reload();

    }
    return (
        <div className={`sidebar ${className || ''}`}>
            {/* 사용자 프로필 섹션 */}
            {showCreateModal && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div
                        className="project-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="project-modal-title">
                            새로운 계획 만들기
                        </div>

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
                                onKeyPress={handleAddKeyPress}
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

            <div className="user-profile"
                 onClick={() => setShowUserInfo(prev => !prev)}>
            <div
                    className="user-profile-content"
                >
                    <div className="user-avatar">
                        <User size={24} color="white" />
                    </div>
                    <div className="user-info">
                        <div className="user-name">
                            {user?.name}
                        </div>
                        <div className="user-project-count">
                            {projects.length}개의 프로젝트
                        </div>
                    </div>
                    <Settings size={18} className="user-settings-icon" />
                </div>

                {/* 사용자 정보 확장 */}
                {showUserInfo && (
                    <div className="user-details">
                        <div className="user-detail-item">
                            <div className="detail-icon phone-icon">📱</div>
                            <div className="detail-content">
                                <span className="detail-label">전화번호</span>
                                <span className="detail-value">{user?.phone}</span>
                            </div>
                        </div>
                        <div className="user-detail-item">
                            <div className="detail-icon birth-icon">🎂</div>
                            <div className="detail-content">
                                <span className="detail-label">생년월일</span>
                                <span className="detail-value">{user?.birth}</span>
                            </div>
                        </div>
                        <div className="user-detail-item logout-item"  onClick={(e) => {
                            e.stopPropagation(); // 부모 이벤트 전파 막기
                            handleLogout();
                        }}>
                            <div className="detail-icon logout-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor"
                                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"
                                              strokeLinecap="round" strokeLinejoin="round"/>
                                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"
                                          strokeLinecap="round"/>
                                </svg>
                            </div>
                            <div className="detail-content">
                                <span className="logout-text">로그아웃</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 프로젝트 섹션 */}
            <div className="projects-section">
                {/* 프로젝트 헤더 */}
                <div
                    onClick={() => setExpandedProjects(!expandedProjects)}
                    className="projects-header"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between', // 좌우로 나눔
                        padding: '8px 12px',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {expandedProjects ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        <FolderOpen size={16}/>
                        계획 목록
                    </div>


                    <div onClick={(e) => {
                        e.stopPropagation(); // 부모 onClick 방지
                        setShowCreateModal(true);
                    }}
                        // onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
                        // onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                         className="project-add-btn"
                    >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </div>
                </div>

                {/* 프로젝트 리스트 */}
                {expandedProjects && (
                    <div className="projects-list">
                        {projects.length === 0 ? (
                            <div className="projects-empty">
                                <FolderOpen size={32} className="projects-empty-icon"/>
                                <div className="projects-empty-title">
                                    계획을 시작해보세요!
                                </div>
                                <div className="projects-empty-subtitle">
                                    다음 계획을 만들어보세요!
                                </div>
                            </div>
                        ) : (
                            projects.map((project) => (
                                <div key={project.id} className="project-item">
                                    {editingProject === project.id ? (
                                        <div className="project-edit">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="project-edit-input"
                                                onKeyPress={handleKeyPress}
                                                autoFocus
                                            />
                                            <div className="project-edit-actions">
                                                <button
                                                    onClick={() => handleEditProject(project.id)}
                                                    className="project-edit-btn project-edit-confirm"
                                                >
                                                    확인
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="project-edit-btn project-edit-cancel"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setSelectedProject(project)}
                                            className="project-item-content"
                                        >
                                            <div className="project-info">
                                                <div className="project-indicator"/>
                                                <span className="project-name"
                                                      style={{fontSize: '14px', color: '#6B7280'}}>
                                                  {project.name}
                                                </span>
                                            </div>

                                            <div className="project-actions">
                                                <button
                                                    onClick={(e) => startEdit(project, e)}
                                                    className="project-action-btn"
                                                >
                                                    <Edit3 size={12}/>
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(project.id, e)}
                                                    className="project-action-btn delete"
                                                >
                                                    <Trash2 size={12}/>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* 하단 푸터 */}
            <div className="sidebar-footer">
                <div className="footer-title">
                    Calendar & Memo App
                </div>
                <div className="footer-version">
                    Version 2.2
                </div>
            </div>
        </div>
    );
};

export default Sidebar;