// extensions/SlashCommand.js
import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { PluginKey } from 'prosemirror-state';
import Suggestion from '@tiptap/suggestion';
import SlashCommandsList from '../components/SlashCommand/SlashCommandsList';
import { calculateSelectBoxPosition } from '../Util/Position';



const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
                pluginKey: new PluginKey('slashCommand'),

                // 명령어 리스트 반환
                items: ({ query }) => {
                    return [
                        {
                            title: 'Heading 1',
                            description: '큰 제목',
                            searchTerms: ['h1', 'heading', '제목', '큰제목'],
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setNode('heading', { level: 1 })
                                    .run();
                            },
                            icon: 'H1',
                        },
                        {
                            title: 'Heading 2',
                            description: '중간 제목',
                            searchTerms: ['h2', 'heading', '제목', '중간제목'],
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setNode('heading', { level: 2 })
                                    .run();
                            },
                            icon: 'H2',
                        },
                        {
                            title: 'Heading 3',
                            description: '작은 제목',
                            searchTerms: ['h3', 'heading', '제목', '작은제목'],
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setNode('heading', { level: 3 })
                                    .run();
                            },
                            icon: 'H3',
                        },
                        {
                            title: 'Bullet List',
                            description: '불릿 리스트',
                            searchTerms: ['ul', 'list', '리스트', '목록', 'bullet'],
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .toggleBulletList()
                                    .run();
                            },
                            icon: '•',
                        },
                        {
                            title: 'Numbered List',
                            description: '번호 리스트',
                            searchTerms: ['ol', 'list', '리스트', '목록', 'numbered', '번호'],
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .toggleOrderedList()
                                    .run();
                            },
                            icon: '1.',
                        },
                        {
                            title: 'Task List',
                            description: '체크리스트',
                            searchTerms: ['task', 'todo', 'checkbox', '체크', '할일', '작업'],
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .toggleTaskList()
                                    .run();
                            },
                            icon: '☐',
                        },
                        {
                            title: 'Quote',
                            description: '인용문',
                            searchTerms: ['quote', 'blockquote', '인용', '인용문'],
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setBlockquote()
                                    .run();
                            },
                            icon: '"',
                        },
                        {
                            title: 'Code Block',
                            description: '코드 블록',
                            searchTerms: ['code', 'codeblock', '코드', '코드블록'],
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setCodeBlock()
                                    .run();
                            },
                            icon: '</>',
                        },
                        {
                            title: 'Horizontal Rule',
                            description: '구분선',
                            searchTerms: ['hr', 'rule', 'line', '구분선', '선'],
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setHorizontalRule()
                                    .run();
                            },
                            icon: '—',
                        },
                    ].filter(item => {
                        if (!query) return true;

                        const searchQuery = query.toLowerCase();
                        return (
                            item.title.toLowerCase().includes(searchQuery) ||
                            item.description.toLowerCase().includes(searchQuery) ||
                            item.searchTerms.some(term => term.toLowerCase().includes(searchQuery))
                        );
                    });
                },

                render: () => {
                    let component;
                    let popup;

                    return {
                        onStart: (props) => {
                            component = new ReactRenderer(SlashCommandsList, {
                                props,
                                editor: props.editor,
                            });

                            popup = document.createElement('div');
                            popup.className = 'slash-commands-popup';
                            document.body.appendChild(popup);
                            popup.appendChild(component.element);

                            // 위치 계산
                            const { selection } = props.editor.state;
                            const { from } = selection;
                            const coords = props.editor.view.coordsAtPos(from);
                            const { top, left } = calculateSelectBoxPosition(coords, 200, 10);

                            popup.style.position = 'absolute';
                            popup.style.top = `${top}px`;
                            popup.style.left = `${left}px`;
                            popup.style.zIndex = '1000';
                        },

                        onUpdate(props) {
                            component.updateProps(props);

                            // 위치 업데이트
                            const { selection } = props.editor.state;
                            const { from } = selection;
                            const start = props.editor.view.coordsAtPos(from);

                            if (popup) {
                                popup.style.top = `${start.top + 25}px`;
                                popup.style.left = `${start.left}px`;
                            }
                        },

                        onKeyDown(props) {
                            if (props.event.key === 'Escape') {
                                popup?.remove();
                                return true;
                            }
                            return component.ref?.onKeyDown?.(props);
                        },

                        onExit() {
                            popup?.remove();
                            component.destroy();
                        },
                    };
                },
            }),
        ];
    },
});

export default SlashCommand;