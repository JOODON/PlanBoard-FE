import React, {  } from 'react';
import { Calendar, FileText } from 'lucide-react';
import './Header.css';

const Header = ({ projects, setProjects, user, currentView, setCurrentView }) => {

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    return (
        <>
            <div className="header">
                {/* 중앙: 모던 탭 스위치 */}
                <div className="view-switch">
                    <button
                        className={`switch-option ${currentView === 'calendar' ? 'active' : ''}`}
                        onClick={() => handleViewChange('calendar')}
                    >
                        <Calendar className="switch-icon" />
                        <span>Calendar</span>
                    </button>
                    <button
                        className={`switch-option ${currentView === 'memo' ? 'active' : ''}`}
                        onClick={() => handleViewChange('memo')}
                    >
                        <FileText className="switch-icon" />
                        <span>Notes</span>
                    </button>
                </div>

                {/* 우측: 프로젝트 수 표시 */}
                <div className="header-right">
                    <div className="project-count">
                        {projects.length} 개 의 프로젝트
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
