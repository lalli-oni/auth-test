async function showTotpSetup() {
  const modal = document.getElementById("totp-setup-modal");
  const loading = document.getElementById("totp-setup-loading");
  const form = document.getElementById("totp-setup-form");
  const errorEl = document.getElementById("totp-setup-error");

  modal.classList.remove("hidden");
  loading.classList.remove("hidden");
  form.classList.add("hidden");
  errorEl.classList.add("hidden");

  try {
    const response = await fetch("/mfa/totp/setup", { method: "POST" });
    const data = await response.json();

    loading.classList.add("hidden");

    if (data.success) {
      document.getElementById("totp-qr-code").src = data.qrCodeDataUrl;
      document.getElementById("totp-secret").textContent = data.secret;
      form.classList.remove("hidden");
    } else {
      errorEl.textContent = "Failed to setup TOTP: " + data.error;
      errorEl.classList.remove("hidden");
    }
  } catch (err) {
    loading.classList.add("hidden");
    errorEl.textContent = "Error: " + err.message;
    errorEl.classList.remove("hidden");
  }
}

function closeTotpSetup() {
  document.getElementById("totp-setup-modal").classList.add("hidden");
}

async function verifyTotpSetup(event) {
  event.preventDefault();
  const code = document.getElementById("verify_code").value;

  try {
    const response = await fetch("/mfa/totp/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();

    if (data.success) {
      window.location.reload();
    } else {
      console.error("[Dashboard] TOTP verification failed:", data.error);
    }
  } catch (err) {
    console.error("[Dashboard] Error during TOTP verification:", err.message);
  }
}

async function deletePasskey(credentialId) {
  if (!confirm("Are you sure you want to remove this passkey?")) return;

  try {
    const response = await fetch("/webauthn/credential/" + credentialId, {
      method: "DELETE",
    });
    const data = await response.json();

    if (data.success) {
      window.location.reload();
    } else {
      console.error("[Dashboard] Failed to remove passkey:", data.error);
    }
  } catch (err) {
    console.error("[Dashboard] Error removing passkey:", err.message);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const verifyForm = document.getElementById("totp-verify-form");
  if (verifyForm) {
    verifyForm.addEventListener("submit", verifyTotpSetup);
  }
});
