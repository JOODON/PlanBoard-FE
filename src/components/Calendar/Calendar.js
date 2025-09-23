import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import './Calendar.css';
import "react-toastify/dist/ReactToastify.css";

const Calendar = ({project, setProjects, setSelectedProject, allProjects = [], setCurrentView}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [draggedEvent, setDraggedEvent] = useState(null);
    const [draggedProject, setDraggedProject] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedProjectForModal, setSelectedProjectForModal] = useState(null);
    const [showAllProjects, setShowAllProjects] = useState(false);

    // 캘린더 날짜 계산
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // 월 이름
    const monthNames = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ];

    // 프로젝트 색상 배열 (전체 일정 보기용)
    const projectColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];

    // 날짜를 YYYY-MM-DD 포맷으로 변환
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 현재 선택된 프로젝트 기간 확인 함수
    const isProjectDate = (day) => {
        if (!project || !project.start || !project.deadline) return null;

        const checkDate = new Date(year, month, day);
        const startDate = new Date(project.start);
        const endDate = new Date(project.deadline);

        const isStart = checkDate.toDateString() === startDate.toDateString();
        const isEnd = checkDate.toDateString() === endDate.toDateString();
        const isInRange = checkDate >= startDate && checkDate <= endDate;

        if (isStart && isEnd) return 'both';
        if (isStart) return 'start';
        if (isEnd) return 'end';
        if (isInRange) return 'range';
        return null;
    };

    // 전체 프로젝트에서 해당 날짜의 프로젝트들 찾기
    const getProjectsForDate = (day) => {
        if (!showAllProjects || !allProjects.length) return [];

        const checkDate = new Date(year, month, day);

        return allProjects.filter(proj => {
            if (!proj.start || !proj.deadline) return false;

            // 날짜만 비교하도록 수정
            const startDate = new Date(proj.start);
            const endDate = new Date(proj.deadline);

            // 시간 제거하고 날짜만 비교
            const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

            return checkDateOnly >= startDateOnly && checkDateOnly <= endDateOnly;
        });
    };

    // 이전/다음 달
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // 프로젝트 클릭 핸들러 (상세보기 모달)
    const handleProjectClick = (projectToShow) => {
        setSelectedProjectForModal(projectToShow);
        setShowProjectModal(true);
    };

    // 전체 일정 보기 토글
    const toggleShowAllProjects = () => {
        setShowAllProjects(!showAllProjects);
    };

    // 드래그 핸들러
    const handleDragStart = (e, event) => {
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleProjectDragStart = (e) => {
        if (project) {
            setDraggedProject(project);
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, day) => {
        e.preventDefault();
        const newDate = new Date(year, month, day);

        if (draggedEvent) {
            setEvents(events.map(event =>
                event.id === draggedEvent.id
                    ? { ...event, date: newDate.toDateString() }
                    : event
            ));
            setDraggedEvent(null);
        }

        if (draggedProject) {
            const currentStart = new Date(draggedProject.start);
            const currentEnd = new Date(draggedProject.deadline);
            const duration = currentEnd - currentStart;

            const newStart = new Date(newDate);
            const newEnd = new Date(newStart.getTime() + duration);

            console.log('프로젝트 날짜 변경:', {
                start: formatDateForInput(newStart),
                deadline: formatDateForInput(newEnd)
            });

            setDraggedProject(null);
        }
    };

    // 해당 날짜의 이벤트 가져오기
    const getEventsForDate = (day) => {
        const dateStr = new Date(year, month, day).toDateString();
        return events.filter(event => {
            if (event.date) return event.date === dateStr;

            if (event.start && event.deadline) {
                const checkDate = new Date(year, month, day);
                const startDate = new Date(event.start);
                const endDate = new Date(event.deadline);
                return checkDate >= startDate && checkDate <= endDate;
            }
            return false;
        });
    };

    // 캘린더 날짜 배열 생성
    const calendarDays = [];

    // 이전 달 빈 칸
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }

    // 현재 달 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const closeProjectModal = () => {
        setShowProjectModal(false);
        setSelectedProjectForModal(null);
    };

    // Calendar 컴포넌트에 useEffect 추가
    useEffect(() => {
        // 프로젝트가 변경되면 해당 프로젝트의 시작일로 캘린더 이동
        if (project && project.start) {
            const projectStartDate = new Date(project.start);
            setCurrentDate(new Date(projectStartDate.getFullYear(), projectStartDate.getMonth(), 1));
        }
    }, [project?.id, project?.start]); // project.id가 변경되거나 start 날짜가 변경될 때

    return (
        <div className="calendar-wrapper">
            <div className="calendar-container">
                {/* 캘린더 헤더 */}
                <div className="calendar-header">
                    <div className="calendar-nav">
                        <button onClick={goToPreviousMonth} className="calendar-nav-btn">
                            <ChevronLeft size={20}/>
                        </button>

                        <h2 className="calendar-title">
                            {year}년 {monthNames[month]}
                        </h2>

                        <button onClick={goToNextMonth} className="calendar-nav-btn">
                            <ChevronRight size={20}/>
                        </button>
                    </div>

                    {/* 전체 일정 보기 토글 */}
                    <div className="calendar-controls">
                        <button
                            onClick={toggleShowAllProjects}
                            className={`toggle-all-projects ${showAllProjects ? 'active' : ''}`}
                        >
                            {showAllProjects ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showAllProjects ? '현재 프로젝트만' : '전체 일정 보기'}
                        </button>
                    </div>
                </div>

                {/* 요일 헤더 */}
                <div className="calendar-weekdays">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                        <div key={day} className="weekday-cell">
                            {day}
                        </div>
                    ))}
                </div>

                {/* 캘린더 그리드 */}
                <div className="calendar-grid">
                    {calendarDays.map((day, index) => {
                        const dayEvents = day ? getEventsForDate(day) : [];
                        const dayProjects = day ? getProjectsForDate(day) : [];
                        const isToday = day &&
                            year === today.getFullYear() &&
                            month === today.getMonth() &&
                            day === today.getDate();
                        const isWeekend = index % 7 === 0 || index % 7 === 6;
                        const isSaturday = index % 7 === 6;
                        const projectDateType = day ? isProjectDate(day) : null;

                        let cellClasses = 'calendar-cell';
                        if (!showAllProjects && projectDateType) {
                            cellClasses += ` project-${projectDateType}`;
                        }
                        if (isToday) {
                            cellClasses += ' today';
                        }

                        return (
                            <div
                                key={index}
                                onDragOver={handleDragOver}
                                onDrop={(e) => day && handleDrop(e, day)}
                                className={cellClasses}
                            >
                                {day && (
                                    <>
                                        <div
                                            className={`date-number ${isToday ? 'today' : ''} ${isWeekend ? (isSaturday ? 'saturday' : 'weekend') : ''}`}>
                                            {day}
                                        </div>

                                        {/* 전체 일정 보기 모드 */}
                                        {showAllProjects ? (

                                            <div className="all-projects-view">

                                                {dayProjects.map((proj, projIndex) => {

                                                    const checkDate = new Date(year, month, day);
                                                    const startDate = new Date(proj.start);
                                                    const endDate = new Date(proj.deadline);
                                                    const isStart = checkDate.toDateString() === startDate.toDateString();
                                                    const isEnd = checkDate.toDateString() === endDate.toDateString();

                                                    let barType = 'range';
                                                    if (isStart && isEnd) barType = 'both';
                                                    else if (isStart) barType = 'start';
                                                    else if (isEnd) barType = 'end';

                                                    const colorIndex = allProjects.indexOf(proj) % projectColors.length;
                                                    const color = projectColors[colorIndex];

                                                    return (
                                                        <div key={proj.id} className="project-in-all-view">
                                                            <div
                                                                className={`project-bar-all ${barType}`}
                                                                style={{backgroundColor: color}}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleProjectClick(proj);
                                                                }}
                                                            />
                                                            {(barType === 'start' || barType === 'both') && (
                                                                <div
                                                                    className="project-label-all"
                                                                    style={{color: color}}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleProjectClick(proj);
                                                                    }}
                                                                >
                                                                    {proj.name ? (proj.name.length > 6 ? proj.name.slice(0, 6) + '…' : proj.name) : '프로젝트'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            /* 현재 프로젝트 보기 모드 */
                                            projectDateType && project && (
                                                <>
                                                    <div
                                                        draggable
                                                        onDragStart={handleProjectDragStart}
                                                        className={`project-bar ${projectDateType}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleProjectClick(project);
                                                        }}
                                                    />

                                                    {(projectDateType === 'start' || projectDateType === 'both') && (
                                                        <>
                                                            <div
                                                                className="project-label"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleProjectClick(project);
                                                                }}
                                                            >
                                                                {project.name ? (project.name.length > 8 ? project.name.slice(0, 8) + '…' : project.name) : '프로젝트'}
                                                            </div>
                                                            <div className="project-marker start"/>
                                                        </>
                                                    )}

                                                    {(projectDateType === 'end' || projectDateType === 'both') && (
                                                        <div className="project-marker end"/>
                                                    )}
                                                </>
                                            )
                                        )}

                                        {/* 이벤트 표시 */}
                                        <div className="events-list">
                                            {dayEvents.slice(0, 2).map(event => (
                                                <div
                                                    key={event.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, event)}
                                                    className="event-item"
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 2 && (
                                                <div className="events-overflow">
                                                    +{dayEvents.length - 2}개 더
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 프로젝트 상세보기 모달 */}
                {showProjectModal && selectedProjectForModal && (
                    <div className="modal-backdrop" onClick={closeProjectModal}>
                        <div
                            className="modal project-detail-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="project-detail-header">
                                <h3 className="project-detail-title">
                                    {selectedProjectForModal.name || '프로젝트'}
                                </h3>
                                <button
                                    onClick={closeProjectModal}
                                    className="modal-close-btn"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="project-detail-body">
                                <div className="project-detail-info">
                                    <div className="project-detail-item">
                                        <label>시작일:</label>
                                        <span>{selectedProjectForModal.start || '미설정'}</span>
                                    </div>

                                    <div className="project-detail-item">
                                        <label>마감일:</label>
                                        <span>{selectedProjectForModal.deadline || '미설정'}</span>
                                    </div>

                                    <div className="project-detail-item">
                                        <label>진행 상태:</label>
                                        <span className="project-status">
                                            {(() => {
                                                const now = new Date();
                                                const start = new Date(selectedProjectForModal.start);
                                                const end = new Date(selectedProjectForModal.deadline);

                                                if (now < start) return '시작 전';
                                                if (now > end) return '완료/지연';
                                                return '진행 중';
                                            })()}
                                        </span>
                                    </div>

                                    {selectedProjectForModal.description && (
                                        <div className="project-detail-item">
                                            <label>설명:</label>
                                            <p className="project-description">
                                                {selectedProjectForModal.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="project-detail-footer">
                                <button
                                    onClick={() => {
                                        setSelectedProject(selectedProjectForModal);
                                        closeProjectModal();
                                        setCurrentView('memo')
                                    }}
                                    className="project-detail-btn project-select-btn"
                                >
                                    메모로 이동
                                </button>
                                <button
                                    onClick={closeProjectModal}
                                    className="project-detail-btn project-close-btn"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;