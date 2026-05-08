<script>
  let user = null;
  let usage = [];
  let error = "";
  let billingMsg = "";
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { user = d.user; usage = d.usage || []; })
      .catch(() => { error = "Not signed in"; });
  } else {
    error = "Not signed in";
  }

  async function startCheckout() {
    billingMsg = "";
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      billingMsg = data.error || "Billing unavailable";
      return;
    }
    if (data.url) window.location.href = data.url;
  }
</script>

<div class="dashboard">
  <h2>Your dashboard</h2>
  {#if error}
    <p class="error">{error}. <a href="#/login">Log in</a></p>
  {:else if user}
    <section>
      <h3>Profile</h3>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Region:</strong> {user.region || "—"}</p>
      <p><strong>Billing:</strong> {user.billing_status ?? "none"}</p>
      {#if user.role === "user"}
        <p>
          <button type="button" on:click={() => startCheckout()}>Subscribe / manage billing</button>
        </p>
        {#if billingMsg}<p class="msg">{billingMsg}</p>{/if}
      {/if}
    </section>
    <section>
      <h3>Your usage</h3>
      {#if usage.length}
        <ul>
          {#each usage as u}
            <li>{u.period_start}: {u.request_count} requests</li>
          {/each}
        </ul>
      {:else}
        <p>No usage recorded yet.</p>
      {/if}
    </section>
  {/if}
  <p><a href="#/">← Home</a> · <a href="#/login">Switch account</a></p>
</div>

<style>
  .dashboard { max-width: 36rem; margin: 2rem auto; padding: 1.5rem; }
  .dashboard section { margin-bottom: 1.5rem; }
  .dashboard h3 { margin-bottom: 0.5rem; }
  .error { color: #c00; }
  .msg { color: #555; font-size: 0.9rem; }
</style>
