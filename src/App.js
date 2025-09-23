import React, { useState, useEffect } from 'react';
import Sidebar from './components/SideBar/Sidebar';
import TextBoard from './components/TextBoard/TextBoard';
import Calendar from './components/Calendar/Calendar';
import Header from './components/Header/Header';
import {createUser, getUser} from './api/UserApi';
import {createProject, getProjectsByUser} from './api/ProjectApi';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './toast.css';
import './index.css';
import {getStoredUserId} from "./Util/UserInfo";

function App() {
    const [user, setUser] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showUserModal, setShowUserModal] = useState(true);

    const [nameInput, setNameInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [birthInput, setBirthInput] = useState('');

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    // 새로 추가: 현재 뷰 상태 (calendar 또는 memo)
    const [currentView, setCurrentView] = useState('calendar');

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

    const handleUserSubmit = async () => {
        if (!nameInput || !phoneInput || !birthInput) {
            toast.warn("모든 정보를 입력해주세요! ⚠️", {
                toastClassName: "my-warn-toast",
                bodyClassName: "my-toast-body",
            });
            return;
        }

        const newUser = { name: nameInput, phone: phoneInput, birth: birthInput };

        try {
            const savedUser = await createUser(newUser);
            localStorage.setItem("userId", savedUser.id);
            setUser(savedUser);
            setShowUserModal(false);
            toast.success("사용자 인증 완료! 🎉");
        } catch (error) {
            console.error("사용자 저장 실패:", error);
            toast.error(error.message || "서버와 통신 중 오류가 발생했습니다!");
        }
    };

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
            {/* Sidebar */}
            {user && (
                <Sidebar
                    user={user}
                    showUserInfo={showUserInfo}
                    setShowUserInfo={setShowUserInfo}
                    projects={projects}
                    setSelectedProject={setSelectedProject}
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
                <div style={{ flex: 1, padding: '20px', background: '#f8f9fa' }}>
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
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="user-info-form">
                        <div className="form-header">
                            <h3 className="form-title">사용자 정보 입력</h3>
                            <span className="form-subtitle">기본 정보를 입력해주세요</span>
                        </div>

                        <div className="form-fields">
                            <div className="input-group">
                                <label className="input-label">이름</label>
                                <input
                                    type="text"
                                    placeholder="이름을 입력해주세요"
                                    value={nameInput}
                                    onChange={e => setNameInput(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">전화번호</label>
                                <input
                                    type="text"
                                    placeholder="전화번호를 입력해주세요"
                                    value={phoneInput}
                                    onChange={e => setPhoneInput(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">생년월일</label>
                                <input
                                    type="date"
                                    value={birthInput}
                                    onChange={e => setBirthInput(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <button onClick={handleUserSubmit} className="submit-btn">
                            <span>확인</span>
                        </button>
                    </div>
                </div>
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
        </div>
    );
}

export default App;