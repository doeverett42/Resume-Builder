const {app, BrowserWindow, screen} = require('electron')
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