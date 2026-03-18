import App from "./App.svelte";
const el = document.getElementById("app");
if (el) {
  el.innerHTML = "";
  new App({ target: el });
}
