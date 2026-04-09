const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  Menu.setApplicationMenu(null);

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// IPC handler to launch external applications
ipcMain.on('launch-external-app', (event, appName) => {
  if (appName === 'brave') {
    let command = '';
    
    // Determine the likely path based on OS
    if (os.platform() === 'win32') {
      command = 'start "" "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"';
    } else if (os.platform() === 'darwin') {
      command = 'open -a "Brave Browser"';
    } else {
      command = 'brave-browser';
    }
    
    exec(command, (error) => {
      if (error) {
        console.error(`Failed to launch Brave: ${error.message}`);
        // Fallback for Windows if installed in local app data
        if (os.platform() === 'win32') {
          const fallbackCommand = `start "" "${os.homedir()}\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"`;
          exec(fallbackCommand, (fallbackError) => {
            if (fallbackError) {
              console.error(`Fallback failed: ${fallbackError.message}`);
              event.reply('external-app-not-found', 'Brave Browser introuvable sur ce système. Vous pouvez l\'installer directement.');
            }
          });
        } else {
          event.reply('external-app-not-found', 'Brave Browser introuvable sur ce système. Vous pouvez l\'installer directement.');
        }
      }
    });
  }
});

// IPC handler to install external applications
ipcMain.on('install-external-app', (event, appName) => {
  if (appName === 'brave') {
    if (os.platform() === 'win32') {
      event.reply('external-app-install-status', 'Téléchargement et installation de Brave en cours (cela peut prendre quelques minutes)...');
      
      // Using winget as the modern standard for Windows app installation
      const installCommand = 'winget install --id Brave.Brave --silent --accept-package-agreements --accept-source-agreements';
      
      exec(installCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Install error via winget: ${error.message}`);
          
          // Fallback: PowerShell web request and execution
          event.reply('external-app-install-status', 'Méthode alternative : Téléchargement de l\'installateur...');
          const psCommand = `powershell -Command "Invoke-WebRequest -Uri 'https://referrals.brave.com/latest/BraveBrowserSetup.exe' -OutFile '$env:TEMP\\BraveBrowserSetup.exe'; Start-Process -FilePath '$env:TEMP\\BraveBrowserSetup.exe' -Wait"`;
          
          exec(psCommand, (psError) => {
            if (psError) {
              event.reply('external-app-error', 'L\'installation automatique a échoué. Veuillez l\'installer manuellement depuis brave.com.');
            } else {
              event.reply('external-app-install-success', 'Brave a été installé avec succès ! Vous pouvez maintenant le lancer.');
            }
          });
        } else {
          event.reply('external-app-install-success', 'Brave a été installé avec succès ! Vous pouvez maintenant le lancer.');
        }
      });
    } else if (os.platform() === 'darwin') {
      event.reply('external-app-error', 'Sur Mac, ouvrez le Terminal et tapez: brew install --cask brave-browser');
    } else {
      event.reply('external-app-error', 'Sur Linux, veuillez utiliser votre gestionnaire de paquets (ex: apt, dnf, pacman).');
    }
  }
});

// REAL OS BACKEND FUNCTIONALITIES
const net = require('net');

ipcMain.handle('execute-command', async (event, command) => {
  return new Promise((resolve) => {
    // Determine appropriate shell
    const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash';
    
    exec(command, { shell, maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
      resolve({
        error: error ? error.message : null,
        stdout: stdout || '',
        stderr: stderr || '',
        code: error ? error.code : 0
      });
    });
  });
});

ipcMain.handle('scan-port', async (event, host, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve({ port, status: 'open' });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ port, status: 'filtered' });
    });
    
    socket.on('error', (err) => {
      socket.destroy();
      resolve({ port, status: 'closed', error: err.message });
    });
    
    socket.connect(port, host);
  });
});

ipcMain.handle('get-system-info', async () => {
  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    cpus: os.cpus(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    networkInterfaces: os.networkInterfaces(),
    uptime: os.uptime()
  };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
