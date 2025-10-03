import React, { useState, useEffect } from 'react';
import Sidebar from './components/SideBar/Sidebar';
import TextBoard from './components/TextBoard/TextBoard';
import Calendar from './components/Calendar/Calendar';
import Header from './components/Header/Header';

import { getUser } from './api/UserApi';
import { signUp } from './api/AuthApi';
import {getProjectsByUser} from './api/ProjectApi';
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import './toast.css';
import './index.css';

import  SignupFlow  from "./components/Auth/SignupFlow"
import {getStoredUserId} from "./Util/UserInfo";

import { Menu, X } from 'lucide-react';

function App() {
    const [user, setUser] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showUserModal, setShowUserModal] = useState(true);

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    const [currentView, setCurrentView] = useState('calendar');

    // 모바일 사이드바 상태
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const initUser = async () => {
            const storedUserId = getStoredUserId();
            if (storedUserId) {
                try {
                    const response = await getUser(storedUserId);
                    setUser(response);
                    setShowUserModal(false);
                } catch (error) {
                    console.error("유저 조회 실패:", error);
                    toast.error("사용자 정보를 불러오지 못했습니다.");
                    localStorage.removeItem("userId");
                }
            }
        };
        initUser();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) return;
            try {
                const projectsData = await getProjectsByUser(user.id);
                setProjects(projectsData);
                if (projectsData.length > 0)
                    setSelectedProject(projectsData[0]);
            } catch (error) {
                console.error("프로젝트 조회 실패:", error);
                toast.error("프로젝트 불러오기 실패");
            }
        };
        fetchProjects();
    }, [user]);

    if (!user && !showUserModal) return null;

    return (
        <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
            {/* 모바일 햄버거 메뉴 버튼 */}
            {user && (
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '20px',
                        zIndex: 998,
                        background: '#0066ff',
                        color: 'white',
                        border: 'none',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            )}

            {/* 사이드바 오버레이 */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay active"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - 기존 코드 */}
            {user && (
                <Sidebar
                    className={isSidebarOpen ? 'open' : ''}
                    user={user}
                    showUserInfo={showUserInfo}
                    setShowUserInfo={setShowUserInfo}
                    projects={projects}
                    setSelectedProject={(project) => {
                        setSelectedProject(project);
                        setIsSidebarOpen(false);
                    }}
                    onEditProject={(id, data) => {
                        setProjects(prev =>
                            prev.map(p => (p.id === id ? { ...p, ...data } : p))
                        );
                        setSelectedProject(prev =>
                            prev && prev.id === id ? { ...prev, ...data } : prev
                        );
                    }}
                    onDeleteProject={(id) => {
                        setProjects(prev => prev.filter(p => p.id !== id));
                        setSelectedProject(prev => (prev && prev.id === id ? null : prev));
                    }}
                    setProjects={setProjects}
                />
            )}

            {/* Main Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header with View Toggle */}
                <Header
                    projects={projects}
                    setProjects={setProjects}
                    user={user}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />

                {/* Content Area */}
                <div style={{
                    flex: 1,
                    padding: '20px',
                    background: '#f8f9fa',
                    overflow: 'auto',
                    width: '100%',
                    boxSizing: 'border-box',
                    minWidth: 0  // 이게 중요! flex item이 줄어들 수 있게 함
                }}>
                    {selectedProject && (
                        <>
                            {currentView === 'calendar' ? (
                                <Calendar
                                    project={selectedProject}
                                    setProjects={setProjects}
                                    setSelectedProject={setSelectedProject}
                                    allProjects={projects}
                                    setCurrentView={setCurrentView}
                                />
                            ) : (
                                <div>
                                    <TextBoard project={selectedProject}/>
                                </div>
                            )}
                        </>
                    )}

                    {!selectedProject && (
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6c757d',
                            fontSize: '18px'
                        }}>
                            새로운 계획을 만들어 보거나, 기존 계획을 불러오세요
                        </div>
                    )}
            </div>
        </div>

            {/* User Modal */}

            {showUserModal && (
                <SignupFlow
                    // 기존 회원일 때
                    // onLoginNeeded={(user) => {
                    //     console.log('로그인 필요:', user);
                    //     toast.info('이미 가입된 회원입니다. 로그인해주세요!');
                    //     setShowUserModal(false);
                    //     // TODO: 로그인 모달 띄우기
                    // }}

                    // 신규 회원 - 회원가입 완료
                    onComplete={async (data) => {
                        console.log('회원가입 데이터:', data);
                        // data = { user: {id, name, ...}, email, password }

                        try {
                            await signUp(
                                data.user,
                                {
                                    email: data.email,
                                    password: data.password
                                }
                            );

                            localStorage.setItem('userId', data.user.id);
                            setUser(data.user);
                            setShowUserModal(false);
                            toast.success('회원가입 완료! 🎉');
                        } catch (error) {
                            toast.error(`회원가입 실패  : ${error.message}`);
                        }
                    }}
                />
            )}

            {/* Toast 전역 설정 */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
                toastClassName="my-toast"
                bodyClassName="my-toast-body"
            />

            {/* 모바일용 CSS 추가 */}
            <style>{`
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default App;