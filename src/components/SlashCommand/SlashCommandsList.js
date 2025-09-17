// components/SlashCommandsList.js
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './SlashCommandsList.css';

const SlashCommandsList = forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { items, command } = props;

    // 키보드 이벤트 처리
    const onKeyDown = ({ event }) => {
        if (event.key === 'ArrowUp') {
            setSelectedIndex((selectedIndex + items.length - 1) % items.length);
            return true;
        }

        if (event.key === 'ArrowDown') {
            setSelectedIndex((selectedIndex + 1) % items.length);
            return true;
        }

        if (event.key === 'Enter') {
            selectItem(selectedIndex);
            return true;
        }

        return false;
    };

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index) => {
        const item = items[index];
        if (item) {
            command(item);
        }
    };

    useImperativeHandle(ref, () => ({
        onKeyDown,
    }));

    return (
        <div className="slash-commands-list">
            {items.length ? (
                items.map((item, index) => (
                    <button
                        className={`slash-command-item ${index === selectedIndex ? 'selected' : ''}`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        <div className="slash-command-icon">{item.icon}</div>
                        <div className="slash-command-content">
                            <div className="slash-command-title">{item.title}</div>
                            <div className="slash-command-description">{item.description}</div>
                        </div>
                    </button>
                ))
            ) : (
                <div className="slash-command-empty">명령을 찾을 수 없습니다</div>
            )}
        </div>
    );
});

SlashCommandsList.displayName = 'SlashCommandsList';

export default SlashCommandsList;