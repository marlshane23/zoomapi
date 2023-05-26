const { app, BrowserWindow, ipcMain } = require('electron');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');

const API_KEY = 'OI8AJ51PQru71qGrUW4wpA';
const API_SEC = 'AcMxRsinMr1ucVNRxCF5VaxkBzvtKt2kGkA5';
const userId = 'N0JrDsJyTpW82ns-JOQveg';

function generateToken() {
  const token = jwt.sign(
    { iss: API_KEY, exp: Math.floor(Date.now() / 1000) + 5000 },
    API_SEC,
    { algorithm: 'HS256' }
  );
  return token;
}

async function createMeeting() {
  const headers = {
    authorization: `Bearer ${generateToken()}`,
    'content-type': 'application/json',
  };

  const meetingDetails = {
    topic: 'aXension',
    type: 2,
    start_time: '2019-06-14T10:21:57',
    duration: '45',
    timezone: 'Europe/Madrid',
    agenda: 'test',
    recurrence: {
      type: 1,
      repeat_interval: 1,
    },
    settings: {
      host_video: 'true',
      participant_video: 'true',
      join_before_host: 'False',
      mute_upon_entry: 'False',
      watermark: 'true',
      audio: 'voip',
      auto_recording: 'cloud',
    },
  };

  try {
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${userId}/meetings`,
      meetingDetails,
      { headers }
    );

    const meetingId = response.data.id;
    const joinUrl = response.data.join_url;

   
    return joinUrl;
  } catch (error) {
    console.error('Error creating Zoom meeting:', error.message);
    throw error;
  }
}

let mainWindow;
let reportWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadFile('index.html');

  ipcMain.handle('startMeeting', async (event) => {
    try {
      const joinUrl = await createMeeting();
      return joinUrl;
    } catch (error) {
      console.error('Error starting Zoom meeting:', error.message);
      throw error;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (!reportWindow) {
      createReportWindow();
    }
  });
}

function createReportWindow() {
  reportWindow = new BrowserWindow({
    width: 1500,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  reportWindow.loadFile('report.html');

  reportWindow.on('closed', () => {
    reportWindow = null;
  });
}

app.whenReady().then(createMainWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('generate-report', () => {
  if (!reportWindow) {
    createReportWindow();
  }
});
