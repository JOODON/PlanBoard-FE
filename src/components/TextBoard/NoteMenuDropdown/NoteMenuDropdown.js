import React from 'react';
import { createPortal } from 'react-dom';
import {Share2, Edit3, Copy, Trash2, Download, Tag} from 'lucide-react';

const NoteMenuDropdown = ({note, onClose, onMenuClick, buttonRef , documentType}) => {
    const [position, setPosition] = React.useState({ top: 0, right: 0 });

    React.useEffect(() => {
        if (buttonRef?.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top - 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [buttonRef]);

    // 실제 사용을 위한 깔끔한 이벤트 핸들러
    const handleMenuItemClick = (action) => {
        // 함수 체크 후 호출
        if (typeof onMenuClick === 'function') {
            onMenuClick(action, note.id , note);
        }

        // 메뉴 닫기
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    const getMenuItems = () => {
        if (documentType === 'shared') {
            return [
                {
                    id: 'copy-to-project',
                    label: '내 프로젝트로 가져오기',
                    icon: <Download size={20}/>,
                    color: '#3b82f6'
                },
                {
                    id: 'stop-sharing',
                    label: '공유 중지',
                    icon: <Share2 size={20}/>,
                    color: '#6b7280'
                },
                {
                    id: 'delete-shared',
                    label: '공유 목록에서 제거',
                    icon: <Trash2 size={20}/>,
                    color: '#ef4444'
                }
            ];
        }else {
            return [
                {
                    id: 'share',
                    label: '노트 공유해서 작성하기',
                    icon: <Share2 size={20}/>,
                    color: '#3b82f6'
                },
                {
                    id: 'tag',
                    label: '태그',
                    icon: <Tag size={20}/>,
                    color: '#0066ff'  // 메인 블루 컬러로 변경
                },
                {
                    id: 'edit',
                    label: '노트 편집',
                    icon: <Edit3 size={20}/>,
                    color: '#6b7280'
                },
                {
                    id: 'copy',
                    label: '노트 복사',
                    icon: <Copy size={20}/>,
                    color: '#6b7280'
                },
                {
                    id: 'download',
                    label: '다운로드',
                    icon: <Download size={20}/>,
                    color: '#6b7280'
                },

                {
                    id: 'delete',
                    label: '삭제',
                    icon: <Trash2 size={20}/>,
                    color: '#ef4444'
                }
            ];
        }

    };
    const menuItems = getMenuItems()

    const dropdownStyle = {
        position: 'fixed',
        top: position.top,
        right: position.right,
        transform: 'translateX(-10%)',
        width: '240px',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 9999,
        overflow: 'hidden'
    };

    const menuContentStyle = {
        padding: '12px 0'
    };

    const buttonStyle = {
        width: '100%',
        textAlign: 'left',
        padding: '16px 20px',
        background: 'none',
        border: 'none',
        borderRadius: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '400',
        outline: 'none',
        transition: 'background-color 0.15s ease'
    };

    const iconStyle = {
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    };

    const labelStyle = {
        flex: 1,
        fontSize: '16px',
        fontWeight: '400'
    };

    const separatorStyle = {
        height: '1px',
        background: '#f3f4f6',
        margin: '8px 0'
    };

    return createPortal(
        <div
            style={dropdownStyle}
            onClick={(e) => {
                e.stopPropagation(); // 메뉴 영역 클릭시 이벤트 전파 방지
            }}
        >
            <div style={menuContentStyle}>
                {menuItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMenuItemClick(item.id);
                            }}
                            style={{
                                ...buttonStyle,
                                color: item.color
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f9fafb';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                            }}
                        >
                            <div style={{...iconStyle, color: item.color}}>
                                {React.cloneElement(item.icon, { style: { color: item.color } })}
                            </div>
                            <span style={{...labelStyle, color: item.color}}>
                                {item.label}
                            </span>
                        </button>
                        {/* 삭제 버튼 위에 구분선 */}
                        {index === menuItems.length - 2 && (
                            <div style={separatorStyle}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
        , document.body
    );
};

export default NoteMenuDropdown;