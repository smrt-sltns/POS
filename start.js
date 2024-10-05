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
      contextIsolation: false,
    },
  });

  mainWindow.maximize();
  mainWindow.show();
  mainWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`);

  mainWindow.on('close', async (event) => {
    mainWindow.removeAllListeners('close');
    mainWindow.close(); // Ensure window closes even if there's an error
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    (async () => {
      try {
        // await backup_databases_and_images(); // Wait for the backup to finish
        app.quit(); // Quit after the backup
      } catch (error) {
        console.error('Error during app quit backup:', error);
        app.quit(); // Quit even if the backup fails
      }
    })();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC event for quitting the app
ipcMain.on('app-quit', async (evt, arg) => {
  try {
    await backup_databases_and_images(); // Ensure backup before quit
    app.quit();
  } catch (error) {
    console.error('Error during app quit backup:', error);
    app.quit(); // Quit even if the backup fails
  }
});

// IPC event for reloading the app
ipcMain.on('app-reload', (event, arg) => {
  mainWindow.reload();
});

// Context menu setup
contextMenu({
  prepend: (params, browserWindow) => [
    {
      label: 'DevTools',
      click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      },
    },
    {
      label: 'Reload',
      click() {
        mainWindow.reload();
      },
    },
  ],
});
