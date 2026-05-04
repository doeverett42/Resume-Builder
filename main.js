const {app, BrowserWindow, ipcMain, screen} = require('electron')
const dotenv = require('dotenv').config()
const path = require('path')
require('./server.js')

const createWindow = () => {
    const {width, height} = screen.getPrimaryDisplay().workAreaSize

    const objWindow = new BrowserWindow({
        width: width,
        height: height,
        icon: path.join(__dirname, '/public/assets/', 'Dr._Mundo_CorporateMundoTile.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    objWindow.loadFile('/js/index.html')

    objWindow.loadURL(`http://localhost:${process.env.HTTP_PORT}`)
}

//AI generated print handler as the original window printer did not have preview compatibility with electron
ipcMain.handle('print-active-resume', async (event) => {
    const objWindow = BrowserWindow.fromWebContents(event.sender)

    if (!objWindow) {
        return { outcome: 'error', message: 'Unable to find the active window.' }
    }

    return new Promise((resolve) => {
        objWindow.webContents.print(
            {
                silent: false,
                printBackground: true,
                color: true,
                margins: { marginType: 'none' }
            },
            (success, failureReason) => {
                if (!success) {
                    resolve({
                        outcome: 'error',
                        message: failureReason || 'Print failed.'
                    })
                    return
                }

                resolve({ outcome: 'success' })
            }
        )
    })
})

app.whenReady().then(() => {
    createWindow()
    
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length < 1) {
            createWindow() 
        }
    })
})

app.on('window-all-closed', () => {
    if(process.platform != 'darwin') {
        app.quit()
    }
})