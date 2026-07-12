const routes = [];
let currentCleanup = null;

export function on(path, handler) {
  routes.push({ path, handler });
}

export function navigate(hash) {
  window.location.hash = hash;
}

function matchRoute(hash) {
  const clean = hash.replace(/^#\/?/, "") || "/";
  for (const route of routes) {
    const pattern = route.path.replace(/:(\w+)/g, "(?<$1>[^/]+)");
    const regex = new RegExp(`^${pattern}$`);
    const match = clean.match(regex);
    if (match) {
      return { handler: route.handler, params: match.groups || {} };
    }
  }
  return null;
}

async function handleRoute() {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const hash = window.location.hash;
  const match = matchRoute(hash);

  if (match) {
    currentCleanup = await match.handler(match.params);
  } else {
    window.location.hash = "#/";
  }
}

export function start() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}
