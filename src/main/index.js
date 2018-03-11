'use strict'

import { app, BrowserWindow } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      webSecurity: false
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


const {ipcMain} = require('electron')
const {dialog} = require('electron')
const fs = require('fs')
const mm = require('musicmetadata')

ipcMain.on('dialog', (event, arg) => {
  var selected = dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      {name: 'Musics', extensions: ['mp3', 'm4a', 'aac', 'wav']}
    ]
  })

  if (!selected) {
    event.returnValue = null
    return
  }

  event.returnValue = selected
})

ipcMain.on('metadata', (event, arg) => {
  var readableStream = fs.createReadStream(arg)

  var teste = null

  mm(readableStream, function (err, metadata) {
    if (err) throw err

    readableStream.close()

    teste = metadata
    teste['path'] = arg

    event.returnValue = teste
  })
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
