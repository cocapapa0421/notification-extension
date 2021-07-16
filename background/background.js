// Cau hinh fire base
const firebaseConfig = {
  apiKey: 'AIzaSyADsj8ffSWb9CPOj-gH0p37vFnw7DO9T64',
  authDomain: 'todoapp-ae180.firebaseapp.com',
  databaseURL: 'https://todoapp-ae180-default-rtdb.firebaseio.com/',
  projectId: 'todoapp-ae180',
  storageBucket: 'todoapp-ae180.appspot.com',
  messagingSenderId: '846048091861',
  appId: '1:846048091861:web:5bc309202061df77bd4c5c',
  measurementId: 'G-PQE7PQB33C',
};

// Khoi tao Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const todoRef = database.ref('todoapp-ae180-default-rtdb');

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
  todoRef
    .orderByChild('complete')
    .equalTo(false)
    .on('value', createNotification);
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
      todoRef.off('value', createNotification);
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
