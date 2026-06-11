<script>
  let email = "";
  let password = "";
  let remember = true;
  let error = "";
  let token = "";
  let user = null;
  let isAdminLogin = false;
  $: isAdminLogin =
    typeof location !== "undefined" &&
    (location.hash.includes("admin=1") || location.search.includes("admin=1"));

  async function doLogin() {
    error = "";
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password, remember }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      error = data.error || "Login failed";
      return;
    }
    token = data.token;
    user = data.user;
    if (token) localStorage.setItem("token", token);
    location.hash =
      user?.role === "admin" ? "#/admin" : "#/dashboard";
  }
</script>

<div class="login">
  <h2>Login</h2>
  {#if isAdminLogin}
    <p class="notice">
      Admin sign-in. <a href="#/login">Client login</a>
    </p>
  {/if}
  <form on:submit|preventDefault={doLogin}>
    <label
      >Email <input type="email" bind:value={email} placeholder="you@example.com" /></label
    >
    <label
      >Password <input type="password" bind:value={password} required /></label
    >
    <label class="row"
      ><input type="checkbox" bind:checked={remember} /> Stay signed in on this device</label
    >
    <button type="submit">Sign in</button>
  </form>
  <p class="register">
    No account? <a href="#/register">Create one</a>
  </p>{#if error}<p class="error">{error}</p>{/if}
  <p><a href="#/">← Back to home</a></p>
</div>

<style>
  .login {
    max-width: 24rem;
    margin: 2rem auto;
    padding: 1.5rem;
  }
  .login label {
    display: block;
    margin-bottom: 0.75rem;
  }
  .login label.row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  .login input[type="checkbox"] {
    width: auto;
  }
  .login input[type="email"],
  .login input[type="password"] {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
  }
  .login button {
    margin-top: 0.75rem;
    padding: 0.5rem 1rem;
  }
  .login .notice {
    font-size: 0.9rem;
    background: #e8f4fc;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    margin-bottom: 0.75rem;
  }
  .login .notice a {
    color: #0a7ea4;
  }
  .login .register {
    margin-top: 1rem;
    font-size: 0.95rem;
  }.error {
    color: #c00;
    margin-top: 0.5rem;
  }
</style>
