
export function getStoredUserId() {
    return localStorage.getItem("userId");
}

export function removeStoredUserId() {
    return localStorage.removeItem("userId");
}