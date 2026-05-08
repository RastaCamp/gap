<script>
  let analytics = {};
  let users = [];
  let error = "";
  let newEmail = "";
  let newPassword = "";
  let newName = "";
  let newRole = "user";
  let createMsg = "";
  let blastSubject = "";
  let blastHtml = "";
  let blastMsg = "";

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  async function load() {
    if (!token) {
      error = "Not signed in";
      return;
    }
    try {
      const a = await fetch("/api/admin/analytics", { headers: authHeaders });
      if (!a.ok) throw new Error();
      analytics = await a.json();
      const u = await fetch("/api/admin/users", { headers: authHeaders });
      if (!u.ok) throw new Error();
      const ud = await u.json();
      users = ud.data || [];
      error = "";
    } catch {
      error = "Unauthorized or not admin";
    }
  }

  load();

  async function createUser() {
    createMsg = "";
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newEmail.trim(),
        password: newPassword,
        name: newName.trim() || undefined,
        role: newRole,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      createMsg = data.error || "Failed";
      return;
    }
    createMsg = `Created ${data.user?.email}`;
    newEmail = "";
    newPassword = "";
    newName = "";
    await load();
  }

  async function sendBlast() {
    blastMsg = "";
    const res = await fetch("/api/admin/email-blast", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ subject: blastSubject.trim(), html: blastHtml }),
    });
    const data = await res.json().catch(() => ({}));
    blastMsg = res.ok
      ? data.mode === "resend"
        ? `Sent ${data.sent} / ${data.total} via Resend`
        : `Logged for ${data.logged} recipients (set RESEND_API_KEY to send)`
      : data.error || "Failed";
  }
</script>

<div class="admin">
  <h2>Admin</h2>
  {#if error}
    <p class="error">
      {error}.
      <a href="#/login?admin=1">Log in as admin</a>
    </p>
  {:else}
    <section>
      <h3>Analytics</h3>
      <p><strong>Total users:</strong> {analytics.total_users ?? "—"}</p>
      <p><strong>Requests today:</strong> {analytics.total_requests_today ?? "—"}</p>
      <p><strong>By role:</strong> {JSON.stringify(analytics.by_role ?? {})}</p>
    </section>

    <section>
      <h3>Create user</h3>
      <p class="hint">
        After you sign in as admin, add staff or test accounts here. Clients can
        also self-register from the site unless you disable it (<code
          >ALLOW_PUBLIC_REGISTER=false</code
        >).
      </p>
      <form
        class="grid"
        on:submit|preventDefault={() => {
          void createUser();
        }}
      >
        <label>Email <input type="email" bind:value={newEmail} required /></label>
        <label
          >Password <input type="password" bind:value={newPassword} required minlength="8" /></label
        >
        <label>Name <input type="text" bind:value={newName} /></label>
        <label
          >Role
          <select bind:value={newRole}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <button type="submit">Create</button>
      </form>
      {#if createMsg}<p class="msg">{createMsg}</p>{/if}
    </section>

    <section>
      <h3>Email clients</h3>
      <p class="hint">
        Sends HTML email to every account with role <code>user</code> when
        <code>RESEND_API_KEY</code> is set; otherwise it logs the campaign only.
      </p>
      <label>Subject <input type="text" bind:value={blastSubject} /></label>
      <label
        >HTML body <textarea bind:value={blastHtml} rows="6"></textarea></label
      >
      <button type="button" on:click={() => sendBlast()}>Send campaign</button>
      {#if blastMsg}<p class="msg">{blastMsg}</p>{/if}
    </section>

    <section>
      <h3>Billing (Stripe)</h3>
      <p class="hint">
        Configure <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_PRICE_ID</code>,
        webhook to <code>/api/webhooks/stripe</code>, and
        <code>STRIPE_WEBHOOK_SECRET</code>. Users can open checkout from their
        dashboard when enabled.
      </p>
    </section>

    <section>
      <h3>Users</h3>
      {#if users.length}
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Limit</th>
              <th>Billing</th>
            </tr>
          </thead>
          <tbody>
            {#each users as u}
              <tr>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>{u.usage_limit}</td>
                <td>{u.billing_status ?? "—"}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No users yet.</p>
      {/if}
    </section>
  {/if}
  <p><a href="#/">← Home</a></p>
</div>

<style>
  .admin {
    max-width: 52rem;
    margin: 2rem auto;
    padding: 1.5rem;
  }
  .admin section {
    margin-bottom: 2rem;
  }
  .admin table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  .admin th,
  .admin td {
    text-align: left;
    padding: 0.5rem;
    border: 1px solid #ddd;
  }
  .admin .grid {
    display: grid;
    gap: 0.75rem;
    max-width: 28rem;
  }
  .admin label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }
  .admin input,
  .admin select,
  .admin textarea {
    padding: 0.45rem;
    font: inherit;
  }
  .hint {
    font-size: 0.88rem;
    color: #444;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }
  .hint code {
    font-size: 0.85em;
  }
  .error {
    color: #c00;
  }
  .msg {
    color: #067;
    margin-top: 0.5rem;
  }
</style>
