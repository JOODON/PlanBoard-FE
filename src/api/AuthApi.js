import API from "./api";

export const signUp = async (user, auth) => {
    try {

        const response = await API.post("/api/auth", {
            user: {
                name: user.name,
                phone: user.phone,
                birth: user.birth
            },
            email: auth.email,
            password: auth.password
        });

        if (response.data.code !== 200) {
            throw new Error(response.data.message || "사용자 생성 실패");
        }

        return response.data.data;

    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || "서버 오류");
    }
};
