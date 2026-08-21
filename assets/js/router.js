/**
 * Hash-based SPA Router
 * Routes: #/ #/movies/:year #/movies/:year/:slug #/flights #/flights/by-year #/flights/airlines #/other
 */
const Router = (() => {
  const routes = [];
  let notFoundHandler = null;

  function add(pattern, handler) {
    // Convert route pattern to regex: :param becomes named group
    const paramNames = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    routes.push({ regex: new RegExp(`^${regexStr}$`), handler, paramNames });
  }

  function notFound(handler) {
    notFoundHandler = handler;
  }

  function resolve() {
    const hash = location.hash.slice(1) || '/';
    for (const route of routes) {
      const match = hash.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
        route.handler(params);
        return;
      }
    }
    if (notFoundHandler) notFoundHandler();
  }

  function start() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  function navigate(path) {
    location.hash = path;
  }

  return { add, notFound, start, navigate };
})();
