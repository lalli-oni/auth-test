(() => {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const continueBtn = document.getElementById('continue-btn');
  const backBtn = document.getElementById('back-btn');
  const identityDisplay = document.getElementById('identity-display');
  const form = document.querySelector('form[method="post"]');

  if (!step1 || !step2 || !continueBtn || !backBtn || !form) return;

  const keepInDomCheckbox = form.querySelector(
    'input[name="keep_identity_in_dom"]',
  );
  const clearFieldsCheckbox = form.querySelector('input[name="clear_fields"]');

  // Enforce mutual exclusivity between sub-variant checkboxes
  if (keepInDomCheckbox && clearFieldsCheckbox) {
    keepInDomCheckbox.addEventListener('change', () => {
      if (keepInDomCheckbox.checked) clearFieldsCheckbox.checked = false;
    });
    clearFieldsCheckbox.addEventListener('change', () => {
      if (clearFieldsCheckbox.checked) keepInDomCheckbox.checked = false;
    });
  }

  let storedUsername = '';

  continueBtn.addEventListener('click', () => {
    const usernameInput = document.getElementById('username');
    if (!usernameInput) return;

    const username = usernameInput.value.trim();
    if (!username) {
      usernameInput.focus();
      return;
    }

    storedUsername = username;

    // Transition to step 2
    step1.style.display = 'none';
    step2.style.display = '';

    const clearFields = clearFieldsCheckbox?.checked;

    if (clearFields) {
      // Remove username input from DOM, add hidden input for form submission
      usernameInput.remove();
      identityDisplay.style.display = 'none';

      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'username';
      hidden.id = 'username-hidden';
      hidden.value = username;
      form.appendChild(hidden);
    } else {
      // Keep username input in DOM as hidden field
      usernameInput.type = 'hidden';
      identityDisplay.textContent = username;
      identityDisplay.style.display = '';
    }

    document.getElementById('password')?.focus();
  });

  backBtn.addEventListener('click', () => {
    step2.style.display = 'none';
    step1.style.display = '';

    const clearFields = clearFieldsCheckbox?.checked;

    if (clearFields) {
      // Remove the hidden input we created
      const hiddenInput = document.getElementById('username-hidden');
      if (hiddenInput) hiddenInput.remove();

      // Re-create the username input in the form group
      const formGroup = step1.querySelector('.form-group');
      if (formGroup) {
        // Check if a wrapper div exists (from FormGroup component)
        const existingInput = formGroup.querySelector('input');
        if (!existingInput) {
          const newInput = document.createElement('input');
          newInput.type = 'text';
          newInput.id = 'username';
          newInput.name = 'username';
          newInput.autocomplete = 'username';
          newInput.required = true;
          newInput.value = storedUsername;
          formGroup.appendChild(newInput);
        }
      }
    } else {
      // Restore username input to visible text type
      const usernameInput = document.getElementById('username');
      if (usernameInput) {
        usernameInput.type = 'text';
      }
      identityDisplay.style.display = 'none';
    }

    document.getElementById('username')?.focus();
  });
})();
