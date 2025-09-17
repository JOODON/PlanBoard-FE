import API from "./api";

export const createUser = async (user) => {
    try {
        const response = await API.post("/api/users", user);

        if (response.data.code !== 200) {
            throw new Error(response.data.message || "사용자 생성 실패");
        }

        return response.data.data;

    } catch (error) {
        // axios 자체 에러일 수도 있으니 메시지 분기
        throw new Error(error.response?.data?.message || error.message || "서버 오류");
    }
};

export const getUser = async (userId) => {
    try {
        const response = await API.get(`/api/users`, {
            headers: {
                'userId': userId
            }
        });

        const data = response.data.data;
        const status = response.status
        if (!data || status === 400) {
            // 데이터 없으면 400 에러를 강제로 던짐
            const error = new Error('유저 정보를 가져올 수 없습니다.');
            error.status = 400;
            throw error;
        }

        return data;
    } catch (err) {
        // axios 자체 에러든, 위에서 던진 에러든 여기서 처리
        console.error('getUser 에러:', err);
        throw err;
    }
};
