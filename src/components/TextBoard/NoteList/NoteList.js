// ==========================
// 6. components/NoteList.jsx
// ==========================
import React from 'react';
import NoteCard from './NoteCard';

const NoteList = ({ notes, project, loading, onEditNote, onMenuAction , documentType}) => {
    if (loading) {
        return (
            <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
                <p>노트를 불러오는 중...</p>
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className="empty-state">
                <p>"{project.name}" 프로젝트에 메모가 없습니다.</p>
                <p>새 메모를 작성해보세요!</p>
            </div>
        );
    }

    return (
        <div className="notes-container-wrapper">
            {notes.map(note => (

                <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEditNote}
                    onMenuAction={onMenuAction}
                    documentType={documentType}
                />
            ))}
        </div>
    );
};

export default NoteList;