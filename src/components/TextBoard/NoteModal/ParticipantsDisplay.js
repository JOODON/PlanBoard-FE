import React, { useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import './ParticipantsDisplay.css';

const ParticipantsDisplay = ({ isSharing, participants = [], currentUserId }) => {
    const [showTooltip, setShowTooltip] = useState(null);

    // 디버깅용 - 중복 체크
    React.useEffect(() => {
        const userIds = participants.map(p => p.userId);
        const duplicates = userIds.filter((item, index) => userIds.indexOf(item) !== index);
        if (duplicates.length > 0) {
            console.warn('중복된 participants 발견:', duplicates);
            console.warn('전체 participants:', participants);
        }
    }, [participants]);

    // 공유 중이지 않거나 참가자가 없으면 표시하지 않음
    if (!isSharing || participants.length === 0) {
        return null;
    }

    // 중복 제거된 참가자 목록
    const uniqueParticipants = [...new Set(participants)];

    const getBackgroundColor = (userId) => {
        // userId를 기반으로 고유한 색상 생성
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 65%, 60%)`;
    };

    return (
        <div className="participants-display">
            <FaUsers className="participants-icon" />

            <div className="participants-avatars">
                {uniqueParticipants.slice(0, 5).map((participant, index) => (
                    <div
                        key={`participant-${participant.userId}-${index}`}
                        className="participant-avatar-container"
                        onMouseEnter={() => setShowTooltip(participant.userId)}
                        onMouseLeave={() => setShowTooltip(null)}
                    >
                        <div
                            className={`participant-avatar ${
                                participant.userId === currentUserId ? 'current-user' : ''
                            }`}
                            style={{ backgroundColor: getBackgroundColor(participant) }}
                        >
                            {participant.username.substring(1,3)}
                        </div>

                        {/* 툴팁 */}
                        {showTooltip === participant.userId && (
                            <div className="participant-tooltip">
                                {participant.userId === currentUserId ?
                                    `${participant.username} (나)` :
                                    participant.username
                                }
                                <div className="tooltip-arrow"></div>
                            </div>
                        )}
                    </div>
                ))}

                {/* 5명 초과시 +N 표시 */}
                {uniqueParticipants.length > 5 && (
                    <div key="more-count" className="participant-avatar more-count">
                        +{uniqueParticipants.length - 5}
                    </div>
                )}
            </div>

            <span className="participants-count">
        {uniqueParticipants.length}명
      </span>
        </div>
    );
};

export default ParticipantsDisplay;