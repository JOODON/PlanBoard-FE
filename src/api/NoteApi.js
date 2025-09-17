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
    return response.data.data;
};

export const getNoteShareUrl = async ( noteId ) =>{
    const storedUserId = getStoredUserId();
    const response = await API.get(`/api/notes/${noteId}/share`, {
        headers: { 'userId': storedUserId }
    });
    return response.data.data
}
