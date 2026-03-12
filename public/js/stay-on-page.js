document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[method="post"]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    const checkbox = form.querySelector('input[name="stay_on_page"]');
    if (!checkbox || !checkbox.checked) return;

    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: new FormData(form),
      });

      const data = await res.json();
      const container = document.getElementById('alert-container');
      if (!container) return;

      if (data.error) {
        container.innerHTML = `<div class="alert alert-error">${escapeHtml(data.error)}</div>`;
      } else if (data.success) {
        container.innerHTML = `<div class="alert alert-success">${escapeHtml(data.success)}</div>`;
      }
    } catch {
      const container = document.getElementById('alert-container');
      if (container) {
        container.innerHTML =
          '<div class="alert alert-error">Request failed</div>';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  });
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
