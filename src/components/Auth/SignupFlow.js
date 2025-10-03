// SignupFlow.jsx
import React, { useState } from 'react';
import './SignupFlow.css';
import { createUser } from '../../api/UserApi';

const SignupFlow = ({ onComplete, onLoginNeeded }) => {
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState('forward');
    const [currentUser, setCurrentUser] = useState(null);

    const [userInfo, setUserInfo] = useState({
        name: '',
        phone: '',
        birth: ''
    });

    const [authInfo, setAuthInfo] = useState({
        email: '',
        password: '',
        passwordConfirm: ''
    });

    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });

    const handleUserInfoSubmit = async () => {
        if (!userInfo.name || !userInfo.phone || !userInfo.birth) {
            alert('모든 정보를 입력해주세요');
            return;
        }

        try {
            const user = await createUser(userInfo);
            setCurrentUser(user);

            if (user.isAuthExist) {
                // 기존 회원 → Step 3 로그인으로
                setDirection('forward');
                setTimeout(() => setStep(3), 50);
            } else {
                // 신규 회원 → Step 2 회원가입으로
                setDirection('forward');
                setTimeout(() => setStep(2), 50);
            }
        } catch (error) {
            console.error('사용자 조회/생성 실패:', error);
            alert('서버와 통신 중 오류가 발생했습니다');
        }
    };

    const handleAuthInfoSubmit = () => {
        if (!authInfo.email || !authInfo.password) {
            alert('이메일과 비밀번호를 입력해주세요');
            return;
        }

        if (authInfo.password !== authInfo.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다');
            return;
        }

        // 회원가입 완료
        if (onComplete) {
            onComplete({
                user: currentUser,
                auth: {
                    email: authInfo.email,
                    password: authInfo.password
                }
            });
        }
    };

    const handleLoginSubmit = () => {
        if (!loginInfo.email || !loginInfo.password) {
            alert('이메일과 비밀번호를 입력해주세요');
            return;
        }

        // 로그인 완료
        if (onLoginNeeded) {
            onLoginNeeded({
                user: currentUser,
                auth: {
                    email: loginInfo.email,
                    password: loginInfo.password
                }
            });
        }
    };

    const handleBack = () => {
        setDirection('backward');
        setTimeout(() => setStep(1), 50);
    };

    return (
        <div className="signup-flow-overlay">
            <div className="signup-flow-container">

                {/* Step 1: User Info */}
                <div className={`form-card ${step === 1 ? 'active' : 'inactive'} ${direction}`}>
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
                                    value={userInfo.name}
                                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                    className="form-input"
                                    autoFocus
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">전화번호</label>
                                <input
                                    type="text"
                                    placeholder="전화번호를 입력해주세요"
                                    value={userInfo.phone}
                                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">생년월일</label>
                                <input
                                    type="date"
                                    value={userInfo.birth}
                                    onChange={(e) => setUserInfo({ ...userInfo, birth: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <button onClick={handleUserInfoSubmit} className="submit-btn">
                            <span>다음</span>
                        </button>
                    </div>
                </div>

                {/* Step 2: 회원가입 */}
                <div className={`form-card ${step === 2 ? 'active' : 'inactive'} ${direction}`}>
                    <div className="user-info-form">
                        <div className="form-header">
                            <button onClick={handleBack} className="back-btn">
                                ← 이전
                            </button>
                            <h3 className="form-title">로그인 정보 입력</h3>
                            <span className="form-subtitle">이메일과 비밀번호를 설정해주세요</span>
                        </div>

                        <div className="form-fields">
                            <div className="input-group">
                                <label className="input-label">이메일</label>
                                <input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={authInfo.email}
                                    onChange={(e) => setAuthInfo({ ...authInfo, email: e.target.value })}
                                    className="form-input"
                                    autoFocus
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">비밀번호</label>
                                <input
                                    type="password"
                                    placeholder="8자 이상, 영문/숫자/특수문자 포함"
                                    value={authInfo.password}
                                    onChange={(e) => setAuthInfo({ ...authInfo, password: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">비밀번호 확인</label>
                                <input
                                    type="password"
                                    placeholder="비밀번호를 다시 입력해주세요"
                                    value={authInfo.passwordConfirm}
                                    onChange={(e) => setAuthInfo({ ...authInfo, passwordConfirm: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <button onClick={handleAuthInfoSubmit} className="submit-btn">
                            <span>완료</span>
                        </button>
                    </div>
                </div>

                {/* Step 3: 로그인 */}
                <div className={`form-card ${step === 3 ? 'active' : 'inactive'} ${direction}`}>
                    <div className="user-info-form">
                        <div className="form-header">
                            <button onClick={handleBack} className="back-btn">
                                ← 이전
                            </button>
                            <h3 className="form-title">로그인</h3>
                            <span className="form-subtitle">이미 가입된 회원이시네요!</span>
                        </div>

                        <div className="form-fields">
                            <div className="input-group">
                                <label className="input-label">이메일</label>
                                <input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={loginInfo.email}
                                    onChange={(e) => setLoginInfo({ ...loginInfo, email: e.target.value })}
                                    className="form-input"
                                    autoFocus
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">비밀번호</label>
                                <input
                                    type="password"
                                    placeholder="비밀번호를 입력해주세요"
                                    value={loginInfo.password}
                                    onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <button onClick={handleLoginSubmit} className="submit-btn">
                            <span>로그인</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SignupFlow;