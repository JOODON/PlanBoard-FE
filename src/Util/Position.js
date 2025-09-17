// utils/position.js
export function calculateSelectBoxPosition(coords, menuHeight = 200, offset = 5) {
    const viewportHeight = window.innerHeight;

    let top;
    if (coords.bottom + menuHeight + offset > viewportHeight) {
        top = coords.top - menuHeight - offset;
    } else {
        top = coords.bottom + offset;
    }

    return {
        top: Math.max(top, offset),
        left: coords.left,
    };
}
