// Close combo button dropdowns when clicking outside
document.addEventListener('click', (e) => {
  document.querySelectorAll('.combo-btn.open').forEach((btn) => {
    if (!btn.contains(e.target)) {
      btn.classList.remove('open');
    }
  });
});
