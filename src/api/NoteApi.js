import API from "./api";
import {getStoredUserId} from "../Util/UserInfo";

// 새 메모 생성
export const createNote = async (userId, rawContent, projectId) => {
    const response = await API.post(`/api/notes`,
        {
            projectId: projectId,
            raw: rawContent
        },
        {headers: {'userId': userId}}
    );
    return response.data.data;
};


// 기존 메모 업데이트
export const updateNote = async (noteId, userId, rawContent, projectId) => {
    const response = await API.put(`/api/notes/${noteId}`,
        {
            projectId: projectId,
            raw: rawContent
        },
        { headers: { 'userId': userId } }
    );
    return response.data.data;
};

// 메모 삭제
export const deleteNote = async (userId, noteId) => {
    const response = await API.delete(`/api/notes/${noteId}`, {
        headers: { 'userId': userId }
    });
    return response.data.data;
};

export const getNoteList = async (userId, projectId) => {
    const response = await API.get(`/api/notes/${projectId}`, {
        headers: { 'userId': userId }
    });
    let result = response.data.data;

    // 각 노트에 기본 태그 추가
    return result.map(note => ({
        ...note,
        tags: (note.tags && note.tags.length > 0)
            ? note.tags.map(t => t.tag) // 객체 배열 → 문자열 배열
            : ["당신", "메모의", "태그를", "추가해주세요"]
    }));

};

export const getNoteShareUrl = async ( noteId ) =>{
    const storedUserId = getStoredUserId();
    const response = await API.get(`/api/notes/${noteId}/share`, {
        headers: { 'userId': storedUserId },
    });
    return response.data.data
}

export const updateNoteTags = async (noteId, newTags) => {
    const storedUserId = getStoredUserId();
    console.log('Updating tags:', noteId, newTags, 'userId:', storedUserId);

    const response = await API.put(`/api/notes/${noteId}/tags`,
        { tags: newTags },
        { headers: { 'userId': storedUserId } }
    );


    if (!response.data || response.data.code !== 200) {
        throw new Error(response.data?.message || "태그 생성 실패");
    }

    return response.data.data;
}


export const getSharedNoteList = async (userId, projectId) => {
    const response = await API.get(`/api/notes/share`, {
        headers: { 'userId': userId }
    });

    return response.data.data
}