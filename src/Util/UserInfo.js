
export function getStoredUserId() {
    return localStorage.getItem("userId");
}

export function removeStoredUserId() {
    return localStorage.removeItem("userId");
}

export function getAccessToken() {
    return localStorage.getItem("accessToken");
}