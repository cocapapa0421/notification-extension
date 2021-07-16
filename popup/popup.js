const formElement = document.getElementById('form');
formElement.addEventListener('submit', registerSupporter);

function registerSupporter(event) {
  event.preventDefault();
  const inputNameElement = document.querySelector('.inputName');
  const inputPositionElement = document.querySelector('.inputPosition');

  const name = inputNameElement.value;
  const position = inputPositionElement.value;

  if (name && position) {
    chrome.runtime.sendMessage({
      type: 'register',
      options: {
        name,
        position,
        isOnline: true,
      },
    });
  }
}
