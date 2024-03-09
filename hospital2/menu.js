const { Menu, BrowserWindow, app ,dialog} = require('electron');
const path = require('path');

// Function to create a new window
function createNewWindow(page, parentWindow) {
  let newWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    parent: parentWindow, 
  });
 newWindow.on('close', function(e) {
  const choice = dialog.showMessageBoxSync(this,
    {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to quit?'
    });
  if (choice === 1) {
    e.preventDefault();
  }
});
  const isPackaged = app.isPackaged;
  const appPath = isPackaged ? app.getAppPath('exe') : __dirname;
  const pagePath = path.join(appPath, 'pages', `${page}.html`);

  // Use file:// protocol with correct path
  const pageURL = isPackaged ? `file://${appPath}/../../pages/${page}.html` : `file://${pagePath}`;

  newWindow.loadURL(pageURL);

  newWindow.on('closed', function () {
    newWindow = null;
  });

  newWindow.webContents.on('context-menu', (event,params) => {
    event.preventDefault()
 showContextMenu(newWindow, page, { x: params.x, y: params.y });
  });
}

function showContextMenu(window, position) {
  const { x, y } = position;

  const template = [
    {
      label: 'Open New Window',
      click: () => {
        createNewWindow('veiw', window); 
      },
    },
  ];

  const contextMenu = Menu.buildFromTemplate(template);
  contextMenu.popup({ window, x, y });
}


module.exports = { showContextMenu };
