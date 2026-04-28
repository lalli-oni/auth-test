(() => {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const continueBtn = document.getElementById('continue-btn');
  const backBtn = document.getElementById('back-btn');
  const identityDisplay = document.getElementById('identity-display');
  const form = document.querySelector('form[method="post"]');

  if (
    !step1 ||
    !step2 ||
    !continueBtn ||
    !backBtn ||
    !identityDisplay ||
    !form
  ) {
    console.error('[multi-step-login] Missing required DOM elements', {
      step1: !!step1,
      step2: !!step2,
      continueBtn: !!continueBtn,
      backBtn: !!backBtn,
      identityDisplay: !!identityDisplay,
      form: !!form,
    });
    return;
  }

  const clearFieldsCheckbox = form.querySelector('input[name="clear_fields"]');

  let storedUsername = '';
  let clearFieldsAtContinue = false;

  continueBtn.addEventListener('click', () => {
    const usernameInput = document.getElementById('username');
    if (!usernameInput) return;

    if (!usernameInput.value.trim()) {
      usernameInput.reportValidity();
      return;
    }

    storedUsername = usernameInput.value.trim();
    clearFieldsAtContinue = !!clearFieldsCheckbox?.checked;

    // Transition to step 2
    step1.style.display = 'none';
    step2.style.display = '';

    if (clearFieldsAtContinue) {
      // Remove username input from DOM, add hidden input for form submission
      identityDisplay.style.display = 'none';
      usernameInput.remove();

      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'username';
      hidden.id = 'username-hidden';
      hidden.value = storedUsername;
      form.appendChild(hidden);
    } else {
      // Keep username input in DOM as hidden field
      usernameInput.type = 'hidden';
      identityDisplay.textContent = storedUsername;
      identityDisplay.style.display = '';
    }

    document.getElementById('password')?.focus();
  });

  backBtn.addEventListener('click', () => {
    step2.style.display = 'none';
    step1.style.display = '';

    if (clearFieldsAtContinue) {
      // Remove the hidden input we created
      const hiddenInput = document.getElementById('username-hidden');
      if (hiddenInput) hiddenInput.remove();

      // Re-create the username input in the form group
      const formGroup = step1.querySelector('.form-group');
      if (formGroup) {
        const existingInput = formGroup.querySelector('input[name="username"]');
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
