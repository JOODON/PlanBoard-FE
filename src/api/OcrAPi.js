import API from "./api";
import {getStoredUserId} from "../Util/UserInfo";

export const extractText = async (formData) => {
    try {
        const storedUserId = getStoredUserId();

        const response = await API.post(
            `/api/ocr/extract`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    userId: storedUserId,
                },
            }
        );

        if (!response.data || response.data.code !== 200) {
            throw new Error(response.data?.message || "텍스트 추출 실패");
        }

        return response.data.data;
    } catch (error) {
        console.error("OCR 요청 실패:", error);
        throw error;
    }
};