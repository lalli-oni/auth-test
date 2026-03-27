(() => {
  const form = document.querySelector('form[method="post"]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    const useFetch = form.querySelector('input[name="use_fetch"]')?.checked;
    const stayOnPage = form.querySelector(
      'input[name="stay_on_page"]',
    )?.checked;
    const redirectToLogin = form.querySelector(
      'input[name="redirect_to_login"]',
    )?.checked;

    // Only intercept if using fetch; real POST submits go through normally
    if (!useFetch) return;

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

      if (data.error) {
        if (container) {
          container.innerHTML = `<div class="alert alert-error">${escapeHtml(data.error)}</div>`;
        }
      } else if (data.success) {
        // If not staying on page, navigate to the appropriate destination
        if (!stayOnPage) {
          if (redirectToLogin) {
            window.location.href = '/auth/login?redirected=true';
          } else {
            window.location.href = '/dashboard';
          }
          return;
        }
        // Stay on page: show inline message
        if (container) {
          container.innerHTML = `<div class="alert alert-success">${escapeHtml(data.success)}</div>`;
        }
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
})();

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
