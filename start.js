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

  mainWindow.on('closed', (event) => {
    event.preventDefault();

    try {
        console.log('Starting backup before closing the window...');
        
        // Await the backup to sheets function
        backup_databases_and_images()
        .then( promise => {
          console.log(promise);
          
          console.log("done and asdlashdlkashdlkasjdlkasjdlkasjd");
          // Once backup is done, remove the event listener to prevent loop and close the window
          mainWindow.removeAllListeners('close');
          try {
            console.log('Backup complete. Now closing the window...');
            mainWindow.close();  // Now proceed with closing the window
            
          } catch (error) {
            
            console.error('Error during window close backup:', error);
          }

        } ).catch(err => {

          console.error('Error during window close backup:', err);
          mainWindow.close();  // Ensure the window still closes even if there's an error

        });

    } catch (error) {
        console.error('Error during window close backup:', error);
        mainWindow.close();  // Ensure the window still closes even if there's an error
    }
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

    // await backup_databases_and_images();
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
