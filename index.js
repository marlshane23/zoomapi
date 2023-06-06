const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const axios = require('axios');

const clientId = 'sHtaAfrsSwyA4q7FoIdF7w';
const redirectUri = 'https://denisseduque.pythonanywhere.com/?code=agt97jsswUBIbjFaf0MSGKI_A0M4VZqEQ';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadFile('index.html');

  ipcMain.handle('startMeeting', async () => {
    try {
      const meetingId = await createMeeting();
      if (meetingId) {
        const zoomMeetingUrl = `zoommtg://zoom.us/join?confno=${meetingId}`;
        shell.openExternal(zoomMeetingUrl);

        // Wait for a delay before opening the Zoom OAuth page
        setTimeout(() => {
          const zoomOAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
          shell.openExternal(zoomOAuthUrl);
        }, 3000); // Adjust the delay as needed
      } else {
        // Failed to create meeting
        console.error('Failed to create Zoom meeting');
      }
    } catch (error) {
      console.error('Error starting the meeting:', error);
    }
  });

  mainWindow.on('closed', () => {
    app.quit();
  });
}

async function createMeeting() {
  try {
    // Make an API call to create a Zoom meeting
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: 'aXension',
        type: 1,
      },
      {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPSThBSjUxUFFydTcxcUdyVVc0d3BBIiwiZXhwIjoxNjg2MDM0Mzk3LCJpYXQiOjE2ODYwMzA3OTd9.SHluBl0O5EKinnDU7vlMWn7ZPJONbjZtI5abH4M1Av4', // Replace with your valid access token
        },
      }
    );

    // Extract the meeting ID from the response
    const { id } = response.data;

    return id;
  } catch (error) {
    console.error('Failed to create Zoom meeting:', error);
    return null;
  }
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
  // Handle generating the report

});
