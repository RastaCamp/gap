<script>
  let analytics = {}; let users = []; let error = "";
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.ok ? r.json() : Promise.reject()).then((d) => (analytics = d)).catch(() => { error = "Unauthorized or not admin"; });
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.ok ? r.json() : Promise.reject()).then((d) => (users = d.data || [])).catch(() => {});
  } else { error = "Not signed in"; }
</script>
<div class="admin">
  <h2>Admin</h2>
  {#if error}<p class="error">{error}. <a href="#/login">Log in as admin or use Debug Login (dev only)</a></p>
  {:else}
    <section><h3>Analytics</h3><p><strong>Total users:</strong> {analytics.total_users ?? "—"}</p><p><strong>Requests today:</strong> {analytics.total_requests_today ?? "—"}</p><p><strong>By role:</strong> {JSON.stringify(analytics.by_role ?? {})}</p></section>
    <section><h3>User list</h3>{#if users.length}<table><thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Limit</th></tr></thead><tbody>{#each users as u}<tr><td>{u.email}</td><td>{u.name}</td><td>{u.role}</td><td>{u.usage_limit}</td></tr>{/each}</tbody></table>{:else}<p>No users yet.</p>{/if}</section>
  {/if}
  <p><a href="#/">← Home</a></p>
</div>
<style> .admin { max-width: 48rem; margin: 2rem auto; padding: 1.5rem; } .admin table { width: 100%; border-collapse: collapse; } .admin th, .admin td { text-align: left; padding: 0.5rem; border: 1px solid #ddd; } .error { color: #c00; } </style>
