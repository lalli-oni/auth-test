export function adminScript(): string {
  return `// Admin Panel JavaScript

const AdminPanel = {
  currentUserId: null,
  totpInterval: null,

  async init() {
    await this.refreshAll();
  },

  async refreshAll() {
    await Promise.all([
      this.loadUsers(),
      this.loadSessions()
    ]);
  },

  // Users
  async loadUsers() {
    try {
      const res = await fetch('/admin/users');
      const data = await res.json();
      const container = document.getElementById('admin-users-list');
      if (!container) return;

      if (data.users.length === 0) {
        container.innerHTML = '<div class="admin-list-item">No users</div>';
        return;
      }

      container.innerHTML = data.users.map(user => \`
        <div class="admin-list-item">
          <div class="admin-list-item-info" onclick="AdminPanel.showUserDetails(\${user.id})">
            <strong>\${user.username}</strong>
            \${user.totpEnabled ? ' 🔐' : ''}
            \${user.emailMfaEnabled ? ' 📧' : ''}
          </div>
          <div class="admin-list-item-actions">
            <button onclick="AdminPanel.showUserDetails(\${user.id})">View</button>
            <button class="danger" onclick="AdminPanel.deleteUser(\${user.id})">Delete</button>
          </div>
        </div>
      \`).join('');
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  },

  async showUserDetails(userId) {
    try {
      const res = await fetch(\`/admin/users/\${userId}\`);
      const data = await res.json();

      if (!data.success) {
        alert('Failed to load user: ' + data.error);
        return;
      }

      this.currentUserId = userId;
      const user = data.user;

      let html = \`
        <h3>User: \${user.username}</h3>
        <div class="admin-user-details">
          <div class="detail-row">
            <span class="detail-label">ID</span>
            <span>\${user.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span>\${user.email || 'Not set'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">TOTP</span>
            <span>\${user.totpEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email MFA</span>
            <span>\${user.emailMfaEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Created</span>
            <span>\${new Date(user.createdAt).toLocaleString()}</span>
          </div>

          <h4>Quick Actions</h4>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
            <button class="btn btn-small" onclick="AdminPanel.showResetPasswordForm(\${user.id})">Reset Password</button>
            \${user.totpSecret ? \`<button class="btn btn-small" onclick="AdminPanel.showTotpCode(\${user.id})">Show TOTP Code</button>\` : ''}
            <button class="btn btn-small" onclick="AdminPanel.generateEmailCode(\${user.id})">Generate Email Code</button>
          </div>
      \`;

      // TOTP Code Display Area
      if (user.totpSecret) {
        html += \`
          <div id="totp-code-display" style="display: none;">
            <h4>Current TOTP Code</h4>
            <div class="admin-totp-display">
              <div class="admin-totp-code" id="totp-code">------</div>
              <div class="admin-totp-countdown">Refreshes in <span id="totp-countdown">--</span>s</div>
            </div>
          </div>
        \`;
      }

      // Email Codes
      if (data.emailCodes.length > 0) {
        const activeCodes = data.emailCodes.filter(c => !c.used && new Date(c.expiresAt) > new Date());
        if (activeCodes.length > 0) {
          html += \`
            <h4>Active Email Codes</h4>
            \${activeCodes.map(c => \`
              <div class="detail-row">
                <span class="admin-totp-code" style="font-size: 1rem;">\${c.code}</span>
                <span>Expires: \${new Date(c.expiresAt).toLocaleTimeString()}</span>
              </div>
            \`).join('')}
          \`;
        }
      }

      // Passkeys
      html += \`<h4>Passkeys (\${data.passkeys.length})</h4>\`;
      if (data.passkeys.length > 0) {
        html += data.passkeys.map(p => \`
          <div class="detail-row">
            <span>\${p.friendlyName || 'Unnamed'}</span>
            <button class="btn btn-small btn-danger" onclick="AdminPanel.deletePasskey(\${user.id}, '\${p.id}')">Delete</button>
          </div>
        \`).join('');
      } else {
        html += '<div class="detail-row">No passkeys registered</div>';
      }

      // Sessions
      html += \`<h4>Sessions (\${data.sessions.length})</h4>\`;
      if (data.sessions.length > 0) {
        html += data.sessions.map(s => \`
          <div class="detail-row">
            <span>\${s.id.substring(0, 8)}... \${s.mfaVerified ? '✓ MFA' : ''}</span>
            <button class="btn btn-small btn-danger" onclick="AdminPanel.deleteSession('\${s.id}')">Kill</button>
          </div>
        \`).join('');
      } else {
        html += '<div class="detail-row">No active sessions</div>';
      }

      // Recent Events
      if (data.recentEvents.length > 0) {
        html += \`<h4>Recent Events</h4>\`;
        html += data.recentEvents.slice(0, 5).map(e => \`
          <div class="detail-row">
            <span>\${e.eventType}</span>
            <span>\${new Date(e.createdAt).toLocaleTimeString()}</span>
          </div>
        \`).join('');
      }

      html += '</div>';

      this.showModal(html);
    } catch (err) {
      console.error('Failed to load user details:', err);
      alert('Failed to load user details');
    }
  },

  showCreateUserForm() {
    const html = \`
      <h3>Create User</h3>
      <form onsubmit="AdminPanel.createUser(event)">
        <div class="form-group">
          <label for="new-username">Username</label>
          <input type="text" id="new-username" required />
        </div>
        <div class="form-group">
          <label for="new-email">Email (optional)</label>
          <input type="email" id="new-email" />
        </div>
        <div class="form-group">
          <label for="new-password">Password</label>
          <input type="text" id="new-password" required value="password123" />
        </div>
        <button type="submit" class="btn btn-primary">Create User</button>
      </form>
    \`;
    this.showModal(html);
  },

  async createUser(event) {
    event.preventDefault();
    const username = document.getElementById('new-username').value;
    const email = document.getElementById('new-email').value || undefined;
    const password = document.getElementById('new-password').value;

    try {
      const res = await fetch('/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (data.success) {
        this.closeModal();
        await this.loadUsers();
        alert('User created successfully!');
      } else {
        alert('Failed to create user: ' + data.error);
      }
    } catch (err) {
      alert('Error creating user: ' + err.message);
    }
  },

  async deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(\`/admin/users/\${userId}\`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        this.closeModal();
        await this.loadUsers();
      } else {
        alert('Failed to delete user: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  },

  showResetPasswordForm(userId) {
    const html = \`
      <h3>Reset Password</h3>
      <form onsubmit="AdminPanel.resetPassword(event, \${userId})">
        <div class="form-group">
          <label for="reset-password">New Password</label>
          <input type="text" id="reset-password" required value="newpassword123" />
        </div>
        <button type="submit" class="btn btn-primary">Reset Password</button>
      </form>
    \`;
    this.showModal(html);
  },

  async resetPassword(event, userId) {
    event.preventDefault();
    const password = document.getElementById('reset-password').value;

    try {
      const res = await fetch(\`/admin/users/\${userId}/reset-password\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (data.success) {
        alert('Password reset successfully!');
        this.showUserDetails(userId);
      } else {
        alert('Failed to reset password: ' + data.error);
      }
    } catch (err) {
      alert('Error resetting password: ' + err.message);
    }
  },

  async showTotpCode(userId) {
    const display = document.getElementById('totp-code-display');
    if (!display) return;

    display.style.display = 'block';

    // Clear any existing interval
    if (this.totpInterval) {
      clearInterval(this.totpInterval);
    }

    const updateCode = async () => {
      try {
        const res = await fetch(\`/admin/users/\${userId}/totp/current\`);
        const data = await res.json();

        if (data.success) {
          document.getElementById('totp-code').textContent = data.code;
          document.getElementById('totp-countdown').textContent = data.remainingSeconds;
        }
      } catch (err) {
        console.error('Failed to get TOTP code:', err);
      }
    };

    await updateCode();
    this.totpInterval = setInterval(updateCode, 1000);
  },

  async generateEmailCode(userId) {
    try {
      const res = await fetch(\`/admin/users/\${userId}/email-codes\`, {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        alert(\`Email code generated: \${data.code.code}\\nExpires: \${new Date(data.code.expiresAt).toLocaleTimeString()}\`);
        this.showUserDetails(userId);
      } else {
        alert('Failed to generate email code: ' + data.error);
      }
    } catch (err) {
      alert('Error generating email code: ' + err.message);
    }
  },

  async deletePasskey(userId, credentialId) {
    if (!confirm('Are you sure you want to delete this passkey?')) return;

    try {
      const res = await fetch(\`/admin/users/\${userId}/passkeys/\${credentialId}\`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        this.showUserDetails(userId);
      } else {
        alert('Failed to delete passkey: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting passkey: ' + err.message);
    }
  },

  // Sessions
  async loadSessions() {
    try {
      const res = await fetch('/admin/sessions');
      const data = await res.json();
      const container = document.getElementById('admin-sessions-list');
      if (!container) return;

      if (data.sessions.length === 0) {
        container.innerHTML = '<div class="admin-list-item">No active sessions</div>';
        return;
      }

      container.innerHTML = data.sessions.map(session => \`
        <div class="admin-list-item">
          <div class="admin-list-item-info">
            User \${session.userId} \${session.mfaVerified ? '✓' : ''}
          </div>
          <div class="admin-list-item-actions">
            <button class="danger" onclick="AdminPanel.deleteSession('\${session.id}')">Kill</button>
          </div>
        </div>
      \`).join('');
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  },

  async deleteSession(sessionId) {
    try {
      const res = await fetch(\`/admin/sessions/\${sessionId}\`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        await this.loadSessions();
        if (this.currentUserId) {
          this.showUserDetails(this.currentUserId);
        }
      } else {
        alert('Failed to delete session: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting session: ' + err.message);
    }
  },

  async killAllSessions() {
    if (!confirm('Are you sure you want to kill ALL sessions? This will log out all users.')) return;

    try {
      const res = await fetch('/admin/sessions', { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        alert(\`Deleted \${data.deletedCount} sessions\`);
        await this.loadSessions();
      } else {
        alert('Failed to kill sessions: ' + data.error);
      }
    } catch (err) {
      alert('Error killing sessions: ' + err.message);
    }
  },

  // Database reset
  async resetDatabase() {
    if (!confirm('Are you sure you want to RESET the entire database? This will delete ALL data!')) return;
    if (!confirm('This action cannot be undone. Are you REALLY sure?')) return;

    try {
      const res = await fetch('/admin/reset', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        alert('Database reset successfully!');
        window.location.reload();
      } else {
        alert('Failed to reset database: ' + data.error);
      }
    } catch (err) {
      alert('Error resetting database: ' + err.message);
    }
  },

  // Modal
  showModal(html) {
    const modal = document.getElementById('admin-modal');
    const body = document.getElementById('admin-modal-body');
    if (modal && body) {
      body.innerHTML = html;
      modal.classList.remove('hidden');
    }
  },

  closeModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
    // Clear TOTP interval
    if (this.totpInterval) {
      clearInterval(this.totpInterval);
      this.totpInterval = null;
    }
    this.currentUserId = null;
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  AdminPanel.init();
});

// Close modal on click outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('admin-modal');
  if (e.target === modal) {
    AdminPanel.closeModal();
  }
});

// Make it globally available
window.AdminPanel = AdminPanel;
`;
}
