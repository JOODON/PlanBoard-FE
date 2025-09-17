import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './Calendar.css';
import {createProject} from "../../api/ProjectApi";
import {getStoredUserId} from "../../Util/UserInfo";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Calendar = ({project, setProjects, setSelectedProject}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [draggedEvent, setDraggedEvent] = useState(null);
    const [draggedProject, setDraggedProject] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventForm, setEventForm] = useState({ title: '', start: '', deadline: '', description: '' });

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

    // 날짜를 YYYY-MM-DD 포맷으로 변환
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 프로젝트 기간 확인 함수
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

    // 이전/다음 달
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // 날짜 클릭 핸들러
    const handleDateClick = (day) => {
        const clickedDate = new Date(year, month, day);
        const formattedDate = formatDateForInput(clickedDate);

        setSelectedDate(clickedDate);
        setEventForm({
            title: '',
            start: formattedDate,
            deadline: formattedDate,
            description: ''
        });
        setShowEventModal(true);
    };

    // 이벤트 추가
    const handleAddEvent = async () => {
        if (!eventForm.title || !eventForm.start || !eventForm.deadline) return;

        const storageUserId = getStoredUserId();

        try {
            // 서버에 프로젝트 생성
            const newProject = await createProject({
                name: eventForm.title,
                start: eventForm.start,
                deadline: eventForm.deadline,
                userId: storageUserId,
            });

            // Sidebar와 페이지에 반영
            setProjects((prev) => [...prev, newProject]);
            setSelectedProject(newProject); // 생성 직후 바로 선택

            // 폼 초기화
            setEventForm({ title: "", start: "", deadline: "", description: "" });
            setShowEventModal(false);

            toast.success("새 계획이 생성되었습니다!");
        } catch (error) {
            console.error("프로젝트 생성 실패:", error);
            toast.error("계획 생성에 실패했습니다.");
        }
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

    const closeModal = () => {
        setShowEventModal(false);
        setEventForm({ title: '', start: '', deadline: '', description: '' });
    };

    return (
        <div className="calendar-wrapper">
            <div className="calendar-container">
                {/* 캘린더 헤더 */}
                <div className="calendar-header">
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
                        const isToday = day &&
                            year === today.getFullYear() &&
                            month === today.getMonth() &&
                            day === today.getDate();
                        const isWeekend = index % 7 === 0 || index % 7 === 6;
                        const isSaturday = index % 7 === 6;
                        const projectDateType = day ? isProjectDate(day) : null;

                        let cellClasses = 'calendar-cell';
                        if (projectDateType) {
                            cellClasses += ` project-${projectDateType}`;
                        }
                        if (isToday) {
                            cellClasses += ' today';
                        }

                        return (
                            <div
                                key={index}
                                onClick={() => day && handleDateClick(day)}
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

                                        {/* 프로젝트 기간 표시 */}
                                        {projectDateType && project && (
                                            <>
                                                <div
                                                    draggable
                                                    onDragStart={handleProjectDragStart}
                                                    className={`project-bar ${projectDateType}`}
                                                />

                                                {(projectDateType === 'start' || projectDateType === 'both') && (
                                                    <>
                                                        <div className="project-label">
                                                            {project.name ? (project.name.length > 8 ? project.name.slice(0, 8) + '…' : project.name) : '프로젝트'}
                                                        </div>
                                                        <div className="project-marker start"/>
                                                    </>
                                                )}

                                                {(projectDateType === 'end' || projectDateType === 'both') && (
                                                    <div className="project-marker end"/>
                                                )}
                                            </>
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

                                        {/* + 버튼 */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDateClick(day);
                                            }}
                                            className="date-add-btn"
                                        >
                                            <Plus size={12}/>
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 이벤트 추가 모달 */}
                {showEventModal && (
                    <div className="modal-backdrop" onClick={closeModal}>
                        <div
                            className="modal event-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="event-modal-header">
                                <h3 className="event-modal-title">
                                    새 이벤트 추가
                                </h3>
                            </div>

                            <div className="event-modal-body">
                                <div className="event-form-group">
                                    <label className="event-form-label">
                                        이벤트 이름
                                    </label>
                                    <input
                                        type="text"
                                        value={eventForm.title}
                                        onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                                        placeholder="이벤트 이름을 입력하세요"
                                        className="event-form-input"
                                    />
                                </div>

                                <div className="event-form-group">
                                    <label className="event-form-label">
                                        시작 날짜
                                    </label>
                                    <input
                                        type="date"
                                        value={eventForm.start}
                                        onChange={(e) => setEventForm({...eventForm, start: e.target.value})}
                                        className="event-form-input"
                                    />
                                </div>

                                <div className="event-form-group">
                                    <label className="event-form-label">
                                        마감 날짜
                                    </label>
                                    <input
                                        type="date"
                                        value={eventForm.deadline}
                                        onChange={(e) => setEventForm({...eventForm, deadline: e.target.value})}
                                        min={eventForm.start}
                                        className="event-form-input"
                                    />
                                </div>
                            </div>

                            <div className="event-modal-footer">
                                <button onClick={closeModal} className="event-modal-btn event-cancel-btn">
                                    취소
                                </button>
                                <button
                                    onClick={handleAddEvent}
                                    disabled={!eventForm.title || !eventForm.start || !eventForm.deadline}
                                    className="event-modal-btn event-add-btn"
                                >
                                    추가
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