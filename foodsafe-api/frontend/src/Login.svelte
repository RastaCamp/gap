<script>
  let email = "";
  let password = "";
  let error = "";
  let token = "";
  let user = null;
  let isAdminLogin = false;
  $: isAdminLogin = (typeof location !== "undefined" && (location.hash.includes("admin=1") || location.search.includes("admin=1")));

  async function doLogin(role = "user") {
    error = "";
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || "user@example.com", role: isAdminLogin ? "admin" : role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { error = data.error || "Login failed"; return; }
    token = data.token;
    user = data.user;
    if (token) localStorage.setItem("token", token);
    location.hash = user?.role === "admin" ? "#/admin" : "#/dashboard";
  }

  async function doDebugLogin() {
    error = "";
    const res = await fetch("/api/debug-login", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { error = data.error || "Debug login disabled"; return; }
    token = data.token; user = data.user;
    if (token) localStorage.setItem("token", token);
    location.hash = "#/admin";
  }
</script>

<div class="login">
  <h2>Login</h2>
  {#if isAdminLogin}<p class="notice">Signing in as <strong>Admin</strong>. <a href="#/login">Switch to User</a></p>{/if}
  <form on:submit|preventDefault={() => doLogin()}>
    <label>Email <input type="email" bind:value={email} placeholder="you@example.com" /></label>
    <label>Password <input type="password" bind:value={password} placeholder="(optional for demo)" /></label>
    <div class="buttons">
      <button type="submit">Sign in as User</button>
      <button type="button" on:click={() => doLogin("admin")}>Sign in as Admin</button>
    </div>
  </form>
  <p class="debug-label">Dev only:</p>
  <button class="debug" on:click={doDebugLogin}>Debug Login</button>
  {#if error}<p class="error">{error}</p>{/if}
  <p><a href="#/">← Back to home</a></p>
</div>

<style>
  .login { max-width: 24rem; margin: 2rem auto; padding: 1.5rem; }
  .login label { display: block; margin-bottom: 0.75rem; }
  .login input { width: 100%; padding: 0.5rem; margin-top: 0.25rem; }
  .login button { margin-right: 0.5rem; margin-top: 0.5rem; padding: 0.5rem 1rem; }
  .login .buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
  .login .notice { font-size: 0.9rem; background: #e8f4fc; padding: 0.5rem 0.75rem; border-radius: 4px; margin-bottom: 0.75rem; }
  .login .notice a { color: #0a7ea4; }
  .login .debug-label { font-size: 0.85rem; color: #666; margin-top: 1rem; margin-bottom: 0.25rem; }
  .login .debug { background: #f0c674; color: #222; }
  .error { color: #c00; margin-top: 0.5rem; }
</style>
