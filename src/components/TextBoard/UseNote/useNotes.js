import { useState, useEffect } from 'react';
import {
    createNote,
    getNoteList,
    updateNote,
    deleteNote,
    addShareNote,
    updateNoteTags,
    getShareNoteList,
    deleteShareNoteById
} from '../../../api/NoteApi';
import { getStoredUserId } from '../../../Util/UserInfo';
import { toast } from 'react-toastify';
import {copyNoteToClipboard, copyToClipboard} from "../../../Util/NoteUtils";

export const useNotes = (project, documentType) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotesByType = async () => {
        if (documentType === 'personal') {
            await fetchNotes();
        } else {
            await fetchShareNotes();
        }
    };

    const fetchShareNotes = async () => {
        setLoading(true);
        const shortProjectName = project.name.length > 5 ? `${project.name.substring(0, 5)}...` : project.name;

        try {
            setNotes([]);
            const storedUserId = getStoredUserId();
            const data = await getShareNoteList(storedUserId, project.id);

            if (data?.length > 0) {
                setNotes(data);
                toast.success(`"${shortProjectName}"의 공유중인 노트 ${data.length}개를 불러왔어요.`);
            } else {
                setNotes([]);
                toast.info(`"${shortProjectName}"에 공유중인 노트가 없습니다.`);
            }
        } catch (error) {
            console.error('공유 노트 로드 에러:', error);
            setNotes([]);
            toast.error('공유 노트를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchNotes = async () => {
        setLoading(true);
        const shortProjectName = project.name.length > 5 ? `${project.name.substring(0, 5)}...` : project.name;

        try {
            setNotes([]);
            const storedUserId = getStoredUserId();
            const data = await getNoteList(storedUserId, project.id);

            if (data?.length > 0) {
                setNotes(data);
                toast.success(`"${shortProjectName}"의 노트 ${data.length}개를 불러왔어요.`);
            } else {
                setNotes([]);
                toast.info(`"${shortProjectName}"에 노트가 없습니다.`);
            }
        } catch (error) {
            console.error('노트 로드 에러:', error);
            setNotes([]);
            toast.error('노트를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const createNewNote = async (htmlContent) => {
        const storedUserId = getStoredUserId();
        await createNote(storedUserId, htmlContent, project.id);
        toast.success('새 메모가 생성되었습니다.');
        await fetchNotes();
    };

    const updateExistingNote = async (noteId, htmlContent) => {
        const storedUserId = getStoredUserId();
        await updateNote(noteId, storedUserId, htmlContent, project.id);
        toast.success('메모가 수정되었습니다.');
        //await fetchNotes();
        await fetchNotesByType()
    };

    const deleteNoteById = async (noteId) => {
        if (!window.confirm('이 메모를 삭제하시겠습니까?')) return;
        try {
            const storedUserId = getStoredUserId();
            await deleteNote(storedUserId, noteId);
            setNotes(notes.filter(n => n.id !== noteId));
            toast.success('메모가 삭제되었습니다.');
        } catch (error) {
            console.error('메모 삭제 중 오류:', error);
            toast.error(`${error}`);
        }
    };

    const shareNote = async (noteId, projectId) => {
        try {
            const shareUrl = await addShareNote(noteId, projectId);
            await copyToClipboard(shareUrl.url);
            toast.success('공유 링크 복사됨 (Ctrl+V로 붙여넣기)');
        }catch (e){
            toast.error(`공유 노트 생성에 실패하였습니다. ${e}`);
        }
    };

    const updateTags = async (noteId,newTags) => {
        try {
            const tags = await updateNoteTags(noteId, newTags);
            toast.success('공유 링크 복사됨 (Ctrl+V로 붙여넣기)');
            await fetchNotes();
        }catch (e){
            toast.error(`공유 노트 생성에 실패하였습니다. ${e}`);
        }
    }

    const deleteShareNote = async (shareId) => {
        try {
            if (!window.confirm('이 공유 노트를 삭제하시겠습니까?')) return;
            await deleteShareNoteById(shareId);
            setNotes(notes.filter(n => n.shareId !== shareId));
            toast.success('공유 링크가 성공적으로 삭제되었습니다.');
        } catch (e) {
            toast.error(`공유 링크 삭제에 실패했습니다: ${e.message || e}`);
        }
    }

    useEffect(() => {
        fetchNotesByType();
    }, [project?.id, project?.name, documentType]); // documentType 추가

    return {
        notes,
        loading,
        createNewNote,
        updateExistingNote,
        deleteNoteById,
        shareNote,
        updateNoteTags,
        refetch: fetchNotesByType,
        updateTags,
        deleteShareNote
    };
};
