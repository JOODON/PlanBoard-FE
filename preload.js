const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onUserInfo: (callback) => ipcRenderer.on('user-info', (_, data) => callback(data))
});
