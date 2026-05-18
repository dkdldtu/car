const reservationForm = document.getElementById('reservationForm');
const formMessage = document.getElementById('formMessage');

if (reservationForm) {
  reservationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    formMessage.textContent = '접수 중입니다...';
    formMessage.className = 'form-message';

    const formData = new FormData(reservationForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || '예약 접수에 실패했습니다.');
      }

      formMessage.textContent = result.message;
      formMessage.className = 'form-message success';
      reservationForm.reset();
    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.className = 'form-message error';
    }
  });
}
