import API from "./api";
import {getStoredUserId} from "../Util/UserInfo";

export const getProjectsByUser = async (userId) => {
    console.log(API.defaults.headers.common);

    const response = await API.get(`/api/projects`, {
        headers: {
            'userId': userId
        }
    });
    return response.data.data;
};

export const createProject = async (project) => {
    try {
        const userId = getStoredUserId();
        const response = await API.post(`/api/projects`, project, {
            headers: {
                'userId': userId
            }
        });

        if (response.data.code !== 200) {
            throw new Error(response.data.message || "프로젝트 생성 실패");
        }

        return response.data.data; // API 구조에 맞게

    } catch (error) {
        console.error("할일 생성 오류:", error);
        throw error; // 호출 측에서 toast 등으로 처리 가능
    }
};

export const updateProject = async (projectId, project) => {
    try {
        const userId = getStoredUserId();
        const response = await API.put(`/api/projects/${projectId}`, project, {
            headers: {
                'userId': userId
            }
        });

        if (response.data.code !== 200) {
            throw new Error(response.data.message || "프로젝트 수정 실패");
        }

        return response.data.data;

    } catch (error) {
        console.error("프로젝트 수정 오류:", error);
        throw error; // 호출 측에서 toast 등으로 처리 가능
    }
};

export const deleteProject = async (projectId) => {
    try {
        const userId = getStoredUserId();
        const response = await API.delete(`/api/projects/${projectId}`, {
            headers: {
                'userId': userId
            }
        });

        if (response.data.code !== 200) {
            throw new Error(response.data.message || "프로젝트 삭제 실패");
        }

        return response.data.data;

    } catch (error) {
        console.error("프로젝트 삭제 오류:", error);
        throw error; // 호출 측에서 toast 등으로 처리 가능
    }
};
