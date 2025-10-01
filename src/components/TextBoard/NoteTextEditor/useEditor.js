import { useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import SlashCommand from '../../../extensions/SlashCommand';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';

export const useTextEditor = ({ onOCRTrigger } = {}) => {
    const [editorContent, setEditorContent] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: '여기에 내용을 입력해 주세요... "/" 입력시 명령어 메뉴가 나타납니다.',
                showOnlyWhenEditable: true,
                class: 'editor-placeholder',
            }),
            Link.configure({
                autolink: true,
                linkOnPaste: true,
                openOnClick: true,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            SlashCommand,
        ],
        content: editorContent,
        onUpdate: ({ editor }) => {
            setEditorContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (editor) {
            editor.storage.ocrHandler = onOCRTrigger;
        }
    }, [editor, onOCRTrigger]);

    useEffect(() => {
        if (editor && editor.getHTML() !== editorContent) {
            editor.commands.setContent(editorContent);
        }
    }, [editorContent, editor]);

    const setContent = (content) => {
        setEditorContent(content);
        if (editor) {
            editor.commands.setContent(content);
        }
    };

    const clearContent = () => {
        setContent('');
    };

    const focusEditor = () => {
        setTimeout(() => {
            if (editor) {
                editor.chain().focus().run();
            }
        }, 1000);
    };

    return {
        editor,
        editorContent,
        setContent,
        clearContent,
        focusEditor
    };
};
