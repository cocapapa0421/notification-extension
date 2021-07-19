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

const connectedRef = database.ref('.info/connected');
connectedRef.on('value', snapshot => {
  if (snapshot.val() === true) {
    console.log('connected');
  } else {
    console.log('not connected');
  }
});

// Lang nghe thay doi tu database, tao notification moi
function createNotification(snapshot) {
  console.log(snapshot.val());
  if (snapshot.val()) {
    const notification = {
      type: 'basic',
      iconUrl: './images/48.png',
      title: 'Request support from wiloke.com',
      message: 'Do you have a new support request?',
      contextMessage: 'Request support!',
      buttons: [{ title: 'Support', iconUrl: '/images/16.png' }],
    };
    chrome.notifications.create('', notification);
  }
}

function enableListener() {
  dbRef.on('value', createNotification);
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

// Chrome notifycation button clicked
chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
  if (btnIdx === 0) {
    chrome.storage.sync.get('wilSupportStaff', ({ wilSupportStaff: sfatt }) => {
      if (sfatt) {
        let url = `${config.url}?position=${sfatt.position}`;
        chrome.tabs.create({ url });
      } else {
        chrome.tabs.create({ url: config.url });
      }
    });
  }

  chrome.notifications.clear(notifId);
});

// Dong cua so (window) hien tai
chrome.windows.onRemoved.addListener(windowId => {
  chrome.storage.sync.get('wilSupportStaff', ({ wilSupportStaff: staff }) => {
    if (staff && staff.isOnline) {
      staff.isOnline = !staff.isOnline;
      chrome.storage.sync.set({ wilSupportStaff: staff });
      dbRef.off('value', createNotification);
    }
  });
});

// onMessage
chrome.runtime.onMessage.addListener(request => {
  switch (request.type) {
    case 'register':
      if (request.options.isOnline) {
        enableListener();
      }
      chrome.storage.sync.set({ wilSupportStaff: request.options });
      break;
    default:
      break;
  }
});
