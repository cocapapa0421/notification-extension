'use strict';
const rootEl = document.getElementById('root');

function registerSupporter(event) {
  event.preventDefault();
  chrome.storage.sync.get('wilSupportStaff', ({ wilSupportStaff: staff }) => {
    if (!!staff) {
      return;
    }
    const inputNameElement = document.querySelector('.inputName');
    const inputRoleElement = document.querySelector('.inputRole');

    const name = inputNameElement.value;
    const role = inputRoleElement.value;

    if (!!name && !!role) {
      const options = {
        name,
        role,
        isOnline: true,
      };
      chrome.runtime.sendMessage({
        type: 'REGISTER',
        options,
      });
      chrome.storage.sync.set({ wilSupportStaff: options });
      render();
    }
  });
}

function reRegister(event) {
  event.preventDefault();
  chrome.storage.sync.remove('wilSupportStaff');
  chrome.runtime.sendMessage({ type: 'RE_REGISTER' });
  render();
}

function render() {
  chrome.storage.sync.get('wilSupportStaff', ({ wilSupportStaff: staff }) => {
    const options = [
      { role: '', text: 'Chọn vai trò' },
      { role: 'leader', text: 'Leader' },
      { role: 'staff', text: 'Staff' },
    ];
    const optionsHtml = options
      .map(
        option =>
          `<option value="${option.role}" ${
            !!staff && option.role === staff.role ? 'selected' : ''
          }>${option.text}</option>`
      )
      .join(' ');
    const html = `
      <header class="head">
        <span>Register</span>
      </header>
      <form id="form" class="form">
        <div class="form__row grid">
          <label class="form__label">Name</label>
          <input
            class="form__input inputName"
            type="text"
            placeholder="Nhập họ tên..."
            value="${!!staff && staff.name ? staff.name : ''}"
            required
          />
        </div>
        <div class="form__row grid">
          <label class="form__label" for="">Role</label>
          <select name="" class="form__input inputRole" required>
            ${optionsHtml}
          </select>
        </div>
        <div class="form__row">
          <button class="button form__button" type="submit">${
            !!staff ? 'Đăng ký thành công' : 'Đăng ký'
          }</button>
          <a href="#" class="re-register ${
            staff ? 'is-active' : ''
          }">Đăng ký lại</a>
        </div>
      </form>
    `;
    rootEl.innerHTML = html;

    const formElement = document.getElementById('form');
    const reRegisterElement = document.querySelector('.re-register');

    formElement.addEventListener('submit', registerSupporter);
    reRegisterElement.addEventListener('click', reRegister);
  });
}

window.onload = render();
