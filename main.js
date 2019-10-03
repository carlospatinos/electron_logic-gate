const {app, protocol, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windowMain;

// Remove Content-Security-Policy warning
//process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function isDevelopment() {
    return global.process.env.APP_ENV && global.process.env.APP_ENV === 'dev';
}

function isWindows() {
    return process.platform === 'win32'; // Even on 64 bit
}

function createWindowMain() {
    let windowHeight = 20; // Linux
    windowMain = new BrowserWindow({
        width: 700 + (isDevelopment() ? 555 : 0), // + DevTools
        height: windowHeight + (isDevelopment() ? 600 : 222), // Menu + Window
        frame: true,
        autoHideMenuBar: false,
        resizable: true,
        useContentSize: true,
        icon: path.join(__dirname, 'assets/images/icons/round-corner/64x64.png'),
        webPreferences: {
            // partition: 'persist:app',
            nodeIntegration: true
        }
    });

    const {screen} = require('electron');
    console.log('ScaleFactor: ', screen.getPrimaryDisplay().scaleFactor);


    if (isDevelopment()) {
        windowMain.webContents.openDevTools();
    }

    //windowMain.loadFile('public/index.html');
    windowMain.loadURL('app://index.html');

    // Emitted when the window is closed.
    windowMain.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        windowMain = null
    });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
}

const mainMenuTemplate = [{
    label: 'File',
    submenu: [
        {
            label: 'About',
            click() {
                windowMain.loadURL('app://about.html');
            }
        },{
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click() {
                app.quit();
            }
        }
    ]
}];

// If mac, ad empty object to menu
if (process.platform === 'darwin') {
    mainMenuTemplate.unshift({});
}

if (isDevelopment()) {
    mainMenuTemplate.push({
        label: 'Development',
        submenu: [{
            role: 'toggledevtools'
        },{
            id: 'autoReload',
            label: 'Automatic reload',
            type: 'checkbox',
            checked: true,
            click(item, focusedWindow) {
                focusedWindow.webContents.executeJavaScript('sessionStorage.setItem("autoReload", "' + item.checked + '");');
                console.log('ccc', item.checked);
            }
        }]
    },{
        role: 'reload',
        accelerator: process.platform === 'darwin' ? '' : 'F5',
    });
}

// protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: true, bypassCSP: true}}]);
// protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: false, bypassCSP: true}}]);

app.on('ready', () => {
    let scheme = 'app';
    // const { session } = require('electron');
    // const partition = 'persist:app';
    // const ses = session.fromPartition(partition);

    // ses.protocol.registerFileProtocol(scheme, (request, callback) => {
    protocol.registerFileProtocol(scheme, (request, callback) => {
        const url = request.url.substr(scheme.length + 3);
        callback({path: path.normalize(`${__dirname}/public/${url}`)})
    }, (error) => {
        if (error) console.error('Failed to register protocol')
    });
    createWindowMain();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windowMain === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.