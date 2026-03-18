<script>
  import Landing from "./Landing.svelte";
  import Login from "./Login.svelte";
  import Dashboard from "./Dashboard.svelte";
  import Admin from "./Admin.svelte";
  import ApiProduct from "./ApiProduct.svelte";
  import ServiceProduct from "./ServiceProduct.svelte";
  import Features from "./Features.svelte";
  import Pricing from "./Pricing.svelte";
  import Sectors from "./Sectors.svelte";
  import Docs from "./Docs.svelte";
  import Contact from "./Contact.svelte";

  let hash = "";
  function updateHash() {
    hash = (typeof location !== "undefined" && (location.hash || "#/").slice(1)) || "";
  }
  if (typeof window !== "undefined") {
    updateHash();
    window.addEventListener("hashchange", updateHash);
  }
  $: page = hash.split("/").filter(Boolean)[0] || "landing";
</script>

<svelte:window on:hashchange={updateHash} />
<div class="app">
  {#if page === "login"}
    <Login />
  {:else if page === "dashboard"}
    <Dashboard />
  {:else if page === "admin"}
    <Admin />
  {:else if page === "api"}
    <ApiProduct />
  {:else if page === "service"}
    <ServiceProduct />
  {:else if page === "features"}
    <Features />
  {:else if page === "pricing"}
    <Pricing />
  {:else if page === "sectors"}
    <Sectors />
  {:else if page === "docs"}
    <Docs />
  {:else if page === "contact"}
    <Contact />
  {:else}
    <Landing />
  {/if}
</div>

<style>
  .app { min-height: 100vh; }
  :global(body) { margin: 0; font-family: system-ui, sans-serif; }
</style>
