export const copyNoteToClipboard = (raw) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = raw;

    tempDiv.querySelectorAll("br, p, div, h1 ,h2").forEach(el => {
        el.insertAdjacentText("beforebegin", "\n");
    });

    const noteContent = tempDiv.innerText;

    navigator.clipboard.writeText(noteContent)
        .then(() => {
            alert("노트 내용이 복사되었습니다!");
        })
        .catch(err => {
            console.error("복사 실패:", err);
        });

};

export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        } catch (e) {
        }
    }
};