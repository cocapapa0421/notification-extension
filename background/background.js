// Cau hinh fire base
const firebaseConfig = {
  apiKey: 'AIzaSyBAJr3ooGz31cQh4eiLMdqGaF9GwJ3QBcI',
  authDomain: 'myshopkit-66efe.firebaseapp.com',
  databaseURL: 'https://myshopkit-66efe-default-rtdb.firebaseio.com',
  projectId: 'myshopkit-66efe',
  storageBucket: 'myshopkit-66efe.appspot.com',
  messagingSenderId: '1070248391172',
  appId: '1:1070248391172:web:1288ca7181ab0dbfe1fb51',
  measurementId: 'G-BTE3EGDBKH',
};

// Khoi tao Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const dbRef = database.ref('helps');

// Lang nghe thay doi tu database, tao notification moi
function createNotification(snapshot) {
  if (!!snapshot.val()) {
    const [key, item] = Object.entries(snapshot.val());
    const notification = {
      type: 'basic',
      iconUrl: './images/48.png',
      title: item.shopName,
      message: 'Dang can support',
      buttons: [{ title: 'Support', iconUrl: '/images/16.png' }],
    };
    chrome.notifications.create('', notification);
  }
}

function enableListener() {
  dbRef.on('value', createNotification);
}

function disableListener() {
  dbRef.off('value', createNotification);
}

// Mo tab moi/update tab hien tai
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.sync.get('wilSupportStaff', ({ wilSupportStaff: staff }) => {
      if (staff && !staff.isOnline) {
        enableListener();
        staff.isOnline = !staff.isOnline;
        chrome.storage.sync.set({ wilSupportStaff: staff });
      }
    });
  }
});

// Dong cua so (window) hien tai
chrome.windows.onRemoved.addListener(windowId => {
  chrome.storage.sync.get('wilSupportStaff', ({ wilSupportStaff: staff }) => {
    if (staff && staff.isOnline) {
      staff.isOnline = !staff.isOnline;
      chrome.storage.sync.set({ wilSupportStaff: staff });
      disableListener();
    }
  });
});

// Chrome notifycation button clicked
chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
  if (btnIdx === 0) {
    chrome.storage.sync.get('wilSupportStaff', ({ wilSupportStaff: sfatt }) => {
      if (sfatt) {
        let url = `${config.url}?role=${sfatt.role}`;
        chrome.tabs.create({ url });
      } else {
        chrome.tabs.create({ url: config.url });
      }
    });
  }

  chrome.notifications.clear(notifId);
});

// onMessage
chrome.runtime.onMessage.addListener(request => {
  switch (request.type) {
    case 'REGISTER':
      if (request.options.isOnline) {
        enableListener();
      }
      break;
    case 'RE_REGISTER':
      disableListener();
      break;
    default:
      break;
  }
});
