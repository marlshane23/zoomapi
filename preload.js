const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const startMeetingButton = document.getElementById('startMeetingButton');

  startMeetingButton.addEventListener('click', async () => {
    const buttonText = startMeetingButton.textContent;
    alert(`${buttonText} clicked!`);

    try {
      // Request the main process to start the meeting
      const joinUrl = await ipcRenderer.invoke('startMeeting');

      // Open the Zoom meeting URL in the default browser
      require('electron').shell.openExternal(joinUrl);
    } catch (error) {
      console.error('Error starting Zoom meeting:', error.message);
    }
  });
});
