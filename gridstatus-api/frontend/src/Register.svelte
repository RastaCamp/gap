<script>
  let email = "";
  let name = "";
  let password = "";
  let error = "";
  let ok = false;

  async function register() {
    error = "";
    ok = false;
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      error = data.error || "Registration failed";
      return;
    }
    if (data.token) localStorage.setItem("token", data.token);
    ok = true;
    location.hash = "#/dashboard";
  }
</script>

<div class="register">
  <h2>Create account</h2>
  <p class="sub">Clients only. Admins are created from the admin console.</p>
  <form on:submit|preventDefault={register}>
    <label
      >Email <input type="email" bind:value={email} required /></label
    >
    <label
      >Display name <input type="text" bind:value={name} placeholder="optional" /></label
    >
    <label
      >Password <input type="password" bind:value={password} required minlength="8" /></label
    >
    <button type="submit">Register</button>
  </form>
  <p><a href="#/login">Already have an account? Sign in</a></p>
  {#if error}<p class="error">{error}</p>{/if}
  {#if ok}<p class="ok">Welcome — redirecting…</p>{/if}
  <p><a href="#/">← Home</a></p>
</div>

<style>
  .register {
    max-width: 24rem;
    margin: 2rem auto;
    padding: 1.5rem;
  }
  .sub {
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 1rem;
  }
  .register label {
    display: block;
    margin-bottom: 0.75rem;
  }
  .register input {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
  }
  .register button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
  }
  .error {
    color: #c00;
  }
  .ok {
    color: #067;
  }
</style>
