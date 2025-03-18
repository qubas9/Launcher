const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to renderer process
contextBridge.exposeInMainWorld('electron', {
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates')
});
