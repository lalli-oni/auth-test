(() => {
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showAlert(container, type, message) {
    if (container) {
      container.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
    }
  }

  const form = document.querySelector('form[method="post"]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    const useFetch = form.querySelector('input[name="use_fetch"]')?.checked;

    // Only intercept if using fetch; real POST submits go through normally
    if (!useFetch) return;

    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    const container = document.getElementById('alert-container');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: new FormData(form),
      });

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch {
          // Response was not JSON — keep status-based message
        }
        showAlert(container, 'error', errorMsg);
        return;
      }

      const data = await res.json();

      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      if (data.error) {
        showAlert(container, 'error', data.error);
      } else if (data.success) {
        showAlert(container, 'success', data.success);
      } else {
        console.warn('Unexpected response format:', data);
        showAlert(container, 'error', 'Unexpected response from server');
      }
    } catch (err) {
      console.error('Form submission failed:', err);
      showAlert(container, 'error', 'Request failed');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
})();
