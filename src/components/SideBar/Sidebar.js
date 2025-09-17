import React, { useState } from 'react';
import { User, Settings, Edit3, Trash2, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { updateProject, deleteProject } from '../../api/ProjectApi';
import { toast } from "react-toastify";
import './Sidebar.css';

const Sidebar = ({
                     user,
                     showUserInfo,
                     setShowUserInfo,
                     projects,
                     setSelectedProject,
                     onEditProject,
                     onDeleteProject
                 }) => {
    const [editingProject, setEditingProject] = useState(null);
    const [editName, setEditName] = useState('');
    const [expandedProjects, setExpandedProjects] = useState(true);

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

    return (
        <div className="sidebar">
            {/* 사용자 프로필 섹션 */}
            <div className="user-profile">
                <div
                    onClick={() => setShowUserInfo(!showUserInfo)}
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
                            <span>📱</span>
                            <span>전화번호: {user?.phone}</span>
                        </div>
                        <div className="user-detail-item">
                            <span>🎂</span>
                            <span>생년월일: {user?.birth}</span>
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
                >
                    {expandedProjects ?
                        <ChevronDown size={16} /> :
                        <ChevronRight size={16} />
                    }
                    <FolderOpen size={16} />
                    계획 목록
                </div>

                {/* 프로젝트 리스트 */}
                {expandedProjects && (
                    <div className="projects-list">
                        {projects.length === 0 ? (
                            <div className="projects-empty">
                                <FolderOpen size={32} className="projects-empty-icon" />
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
                                                    <Edit3 size={12} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(project.id, e)}
                                                    className="project-action-btn delete"
                                                >
                                                    <Trash2 size={12} />
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
                    Version 2.0
                </div>
            </div>
        </div>
    );
};

export default Sidebar;