const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const tableBody = document.getElementById('reservationTableBody');
const emptyMessage = document.getElementById('emptyMessage');

async function checkAdmin() {
  const response = await fetch('/admin/check');
  const result = await response.json();
  if (result.isAdmin) {
    showDashboard();
    await loadReservations();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
}

function showDashboard() {
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginMessage.textContent = '로그인 중입니다...';
    loginMessage.className = 'form-message';

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || '로그인에 실패했습니다.');
      }

      loginMessage.textContent = result.message;
      loginMessage.className = 'form-message success';
      loginForm.reset();
      showDashboard();
      await loadReservations();
    } catch (error) {
      loginMessage.textContent = error.message;
      loginMessage.className = 'form-message error';
    }
  });
}

async function loadReservations() {
  try {
    const response = await fetch('/api/reservations');
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || '예약 목록을 불러오지 못했습니다.');
    }

    renderReservations(result.reservations || []);
  } catch (error) {
    tableBody.innerHTML = '';
    emptyMessage.textContent = error.message;
    emptyMessage.classList.remove('hidden');
  }
}

function renderReservations(items) {
  tableBody.innerHTML = '';
  if (!items.length) {
    emptyMessage.textContent = '아직 접수된 예약이 없습니다.';
    emptyMessage.classList.remove('hidden');
    return;
  }

  emptyMessage.classList.add('hidden');

  items.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.createdAtKst || ''}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.phone)}</td>
      <td>${escapeHtml(item.rentDate)}</td>
      <td>${escapeHtml(item.returnDate)}</td>
      <td>${escapeHtml(item.carType)}</td>
      <td>${escapeHtml(item.purpose || '-')}</td>
      <td>
        <select class="status-select" data-id="${item.id}">
          ${['접수', '확인중', '예약확정', '취소']
            .map((status) => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>`)
            .join('')}
        </select>
      </td>
      <td>
        <button class="small-btn delete-btn" data-id="${item.id}" type="button">삭제</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  document.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', async (event) => {
      const id = event.target.dataset.id;
      const status = event.target.value;
      await updateStatus(id, status);
    });
  });

  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const id = event.target.dataset.id;
      const confirmed = confirm('이 예약을 삭제하시겠습니까?');
      if (!confirmed) return;
      await deleteReservation(id);
    });
  });
}

async function updateStatus(id, status) {
  try {
    const response = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || '상태 변경에 실패했습니다.');
    }
  } catch (error) {
    alert(error.message);
    await loadReservations();
  }
}

async function deleteReservation(id) {
  try {
    const response = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || '삭제에 실패했습니다.');
    }
    await loadReservations();
  } catch (error) {
    alert(error.message);
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/admin/logout', { method: 'POST' });
    showLogin();
    tableBody.innerHTML = '';
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', loadReservations);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

checkAdmin();
