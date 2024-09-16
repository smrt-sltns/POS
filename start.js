const setupEvents = require('./installers/setupEvents');
if (setupEvents.handleSquirrelEvent()) {
  return;
}

const server = require('./server');
const backup_databases_and_images = require('./backup'); // Corrected import
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const contextMenu = require('electron-context-menu');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1200,
    frame: false,
    minWidth: 1200,
    minHeight: 750,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  });

  mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`);

  mainWindow.on('closed', () => {
    (async () => {
      await backup_databases_and_images();
      mainWindow = null;
    })();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    (async () => {
      await backup_databases_and_images();
      app.quit();
    })();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app-quit', (evt, arg) => {
  (async () => {
    await backup_databases_and_images();
    app.quit();
  })();
});

ipcMain.on('app-reload', (event, arg) => {
  mainWindow.reload();
});

contextMenu({
  prepend: (params, browserWindow) => [
    {
      label: 'DevTools',
      click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      }
    },
    {
      label: 'Reload',
      click() {
        mainWindow.reload();
      }
    }
  ]
});
