import type { FC, PropsWithChildren } from "hono/jsx";
import type { User } from "../services/user.service";
import type { Session } from "../services/session.service";

export interface LayoutProps {
  title: string;
  user?: User | null;
  session?: Session | null;
  showAdminPanel?: boolean;
}

const AdminSidebar: FC = () => (
  <aside class="admin-sidebar">
    <h2>Admin Panel</h2>
    <p class="admin-note">No auth required - for testing only</p>

    <div class="admin-section">
      <h3>Users</h3>
      <div id="admin-users-list" class="admin-list"></div>
      <button onclick="AdminPanel.showCreateUserForm()" class="btn btn-small">
        + Create User
      </button>
    </div>

    <div class="admin-section">
      <h3>Sessions</h3>
      <div id="admin-sessions-list" class="admin-list"></div>
      <button onclick="AdminPanel.killAllSessions()" class="btn btn-small btn-danger">
        Kill All Sessions
      </button>
    </div>

    <div class="admin-section">
      <h3>Quick Actions</h3>
      <button onclick="AdminPanel.resetDatabase()" class="btn btn-small btn-danger">
        Reset Database
      </button>
      <button onclick="AdminPanel.refreshAll()" class="btn btn-small">
        Refresh All
      </button>
    </div>

    <div id="admin-modal" class="admin-modal hidden">
      <div class="admin-modal-content">
        <span class="admin-modal-close" onclick="AdminPanel.closeModal()">
          &times;
        </span>
        <div id="admin-modal-body"></div>
      </div>
    </div>
  </aside>
);

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  title,
  user,
  showAdminPanel = true,
  children,
}) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title} - Auth Test App</title>
      <link rel="stylesheet" href="/css/styles.css" />
    </head>
    <body>
      <div class="app-container">
        <main class="main-content">
          <header class="header">
            <h1>
              <a href="/">Auth Test App</a>
            </h1>
            <nav>
              {user ? (
                <>
                  <span>Welcome, {user.username}</span>
                  <a href="/dashboard">Dashboard</a>
                  <form action="/auth/logout" method="POST" style={{ display: "inline" }}>
                    <button type="submit" class="btn-link">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <a href="/login">Login</a>
                  <a href="/register">Register</a>
                </>
              )}
            </nav>
          </header>
          <div class="content">{children}</div>
        </main>
        {showAdminPanel && <AdminSidebar />}
      </div>
      <script src="/js/webauthn.js"></script>
      <script src="/js/admin.js"></script>
    </body>
  </html>
);
