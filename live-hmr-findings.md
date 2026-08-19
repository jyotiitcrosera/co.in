

# Vite HMR verification — 2026-08-16

The first HMR change added `server.hmr.clientPort = 443` and the server restarted successfully. The public page loads after restart, but the browser console still reports the old localhost:5173 WebSocket setup, likely from a cached/stale Vite client or because the managed preview proxy does not expose the Vite client endpoint directly. A direct request to `/@vite/client` was served by the application 404 fallback rather than the Vite client, so the preview route is not a reliable direct HMR endpoint. Further correction should avoid advertising localhost and should be validated through a fresh preview reload after the dev server stabilizes.
