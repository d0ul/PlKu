const { app, BrowserWindow, screen, globalShortcut, dialog, session } = require('electron');
const path = require('path');
const url = require('url');
const rpc = require('discord-rpc');

const clientId = '1201030465503645696'; // Discord Developer Portal에서 생성한 애플리케이션의 클라이언트 ID를 여기에 입력하세요.

rpc.register(clientId);

const client = new rpc.Client({ transport: 'ipc' });


let mainWindow;
let originalSize;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 950,
    title: 'PlusKKuTu Client',
    maximizable: false,
    icon: __dirname + '/assets/icon.png',
    autoHideMenuBar: true, // 이 부분이 리본바와 상단바를 없애는 옵션입니다.
    webPreferences: {
      devTools: !app.isPackaged,
      nodeIntegration: true
    }
  });

  originalSize = screen.getPrimaryDisplay().workAreaSize;

  const gameUrl = 'https://kkutu.plus/o/game?server=0&clientVer=1';

  const filter = {
    urls: ['https://kkutu.plus/']
  };

  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    callback({
      redirectURL: gameUrl
    });
  });

  mainWindow.loadURL(gameUrl);

  mainWindow.webContents.on('did-finish-load', () => {
  });
  
  mainWindow.on('close', function (e) {
    let response = dialog.showMessageBoxSync(this, {
        type: 'question',
        buttons: ['나가기', '남아있기'],
        title: '정말로 나가시려고요?',
        message: '지금 나가면 너무 아쉬워요!'
    });
    
    if(response == 1) e.preventDefault();
});


  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Ctrl+F로 전체 화면 토글
  globalShortcut.register('CommandOrControl+F', () => {
    toggleFullScreen();
  });

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    dialog.showErrorBox("정말로 개발자 도구를 여시려고요?", "개발자 도구를 이용하여 부정하게 승리하는 행위는 양심없는 행위일 뿐더러 이용 정지를 받을 수 있습니다.");
  });

  client.login({ clientId }).catch(console.error);
  client.on('ready', () => {
    console.log('Discord RPC connected!');
    updateActivity(); // 최초 상태 업데이트
  });

  // 브라우저의 주소가 변경될 때마다 상태 업데이트
  mainWindow.webContents.on('did-navigate-in-page', () => {
    updateActivity();
  });

}

app.on('ready', createWindow);

function updateActivity() {
  const pageURL = mainWindow.webContents.getURL();
  let details, largeImageKey, largeImageText;

  // 예시: 페이지 경로에 따라 다른 상태 설정
  if (pageURL.includes('/login')) {
    details = '로그인 중';
    largeImageKey = 'logo';
    largeImageText = '로그인 중...';
  }
  else if (pageURL.includes('/game')) {
    const urlParams = new URLSearchParams(pageURL.split('?')[1]);
    const server = urlParams.get('server');
    const roomNumber = pageURL.split('#')[1];

    // 서버에 따라 상세 정보 설정
    if (server === '0') {
      details = `[감자] ${roomNumber}번 방`;
    } else if (server === '1') {
      details = `[다래] ${roomNumber}번 방`;
    }

    largeImageKey = 'logo';
    largeImageText = `${roomNumber}번 방`;
  }
   else {
    details = '메인 화면';
    largeImageKey = 'logo';
    largeImageText = '플러스끄투';
  }

  client.setActivity({
    details: details,
    largeImageKey: largeImageKey,
    largeImageText: largeImageText,
    startTimestamp: new Date(),
    instance: false,
  });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// 전체 화면 토글 함수
function toggleFullScreen() {
  if (mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
  } else {
    mainWindow.setFullScreen(true);
  }
}
