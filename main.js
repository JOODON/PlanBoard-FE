const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, 'assets', 'icon.png'), // 아이콘 경로
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    const userInfo = {
        name: "홍길동",
        phone: "01012345678",
        birth: "1995-05-01"
    };

    win.webContents.on('did-finish-load', () => {
        win.webContents.send('user-info', userInfo);
    });

    // DevTools 열기
    win.loadURL('http://localhost:3000/project-manager'); // 여기에 실제 URL 넣기

}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

