<script>
  let user = null; let usage = []; let error = "";
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((d) => { user = d.user; usage = d.usage || []; }).catch(() => { error = "Not signed in"; });
  } else { error = "Not signed in"; }
</script>
<div class="dashboard">
  <h2>Your dashboard</h2>
  {#if error}<p class="error">{error}. <a href="#/login">Log in</a></p>
  {:else if user}
    <section><h3>Profile</h3><p><strong>Name:</strong> {user.name}</p><p><strong>Email:</strong> {user.email}</p><p><strong>Region:</strong> {user.region || "—"}</p><p><strong>Usage limit:</strong> {user.usage_limit ?? "—"}</p></section>
    <section><h3>Your usage</h3>{#if usage.length}<ul>{#each usage as u}<li>{u.period_start}: {u.request_count} requests</li>{/each}</ul>{:else}<p>No usage recorded yet.</p>{/if}</section>
  {/if}
  <p><a href="#/">← Home</a> · <a href="#/login">Switch account</a></p>
</div>
<style> .dashboard { max-width: 36rem; margin: 2rem auto; padding: 1.5rem; } .dashboard section { margin-bottom: 1.5rem; } .error { color: #c00; } </style>
