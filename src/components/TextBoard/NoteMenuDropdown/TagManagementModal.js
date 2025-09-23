import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import './TagModal.css'

const TagManagementModal = ({
                                isOpen,
                                onClose,
                                tags = [],
                                onSave
                            }) => {
    const [currentTags, setCurrentTags] = useState(tags);
    const [newTag, setNewTag] = useState('');

    if (!isOpen) return null;

    const addTag = () => {
        if (newTag.trim() && !currentTags.includes(newTag.trim())) {
            setCurrentTags([...currentTags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = () => {
        onSave(currentTags);
        onClose();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div className="tag-modal-backdrop" onClick={onClose}>
            <div className="tag-modal-content" onClick={e => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="tag-modal-header">
                    <h3>태그 관리</h3>
                    <button className="tag-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* 태그 입력 */}
                <div className="tag-input-section">
                    <small>태그는 최대 5개까지, 글자 수는 10자를 넘을 수 없습니다.</small>
                    <div className="tag-input-wrapper">
                        <input
                            type="text"
                            className="tag-input"
                            placeholder="새 태그를 입력하세요"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className="tag-add-btn"
                            onClick={addTag}
                            disabled={!newTag.trim()}
                        >
                            <FaPlus/>
                        </button>
                    </div>
                </div>

                {/* 현재 태그들 */}
                <div className="tag-list-section">
                    <h4>현재 태그</h4>
                    <div className="tag-list">
                        {currentTags.length === 0 ? (
                            <div className="no-tags">태그가 없습니다</div>
                        ) : (
                            currentTags.map((tag, index) => (
                                <div key={index} className="tag-item">
                                    <span className="tag-name">#{tag}</span>
                                    <button
                                        className="tag-remove-btn"
                                        onClick={() => removeTag(tag)}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 버튼들 */}
                <div className="tag-modal-buttons">
                    <button className="tag-cancel-btn" onClick={onClose}>
                        취소
                    </button>
                    <button className="tag-save-btn" onClick={handleSave}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TagManagementModal;
