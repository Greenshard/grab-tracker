# grab-tracker

Live map for a Grab Food share-location link. Shows three things: the pickup pin, the delivery pin, and the driver's position, refreshed every 15 seconds.

## Usage

Open the root page and paste a share link, or map the link onto the tracker URL directly:

| Grab link | Tracker URL |
|---|---|
| `sharelocation.grab.com/o/<token>` | `/o/<token>` |
| `app.grab.com/s/<code>` | `/s/<code>` |

Only food orders are mapped. Other share types found through `/s/` redirect to Grab's own page.

## How it works

- `server.ts` is a small Bun server. It serves `index.html` and proxies one unauthenticated Grab endpoint, `api.grab.com/api/v1/safety/sharemyride/<token>/bookingdetails`. The proxy is needed because api.grab.com answers 403 to any browser origin other than sharelocation.grab.com.
- `/s/<code>` follows the app.grab.com redirect and extracts the token from the `shareOrderLink` parameter of the deep link.
- `index.html` is a single Leaflet page on OpenStreetMap tiles. The driver route comes from `route.encodedSteps` (Google polyline, 1e6 precision).

No build step and no dependencies beyond Bun.

## Run

```
bun server.ts
```

Listens on `127.0.0.1:3471` by default. Set `HOST` and `PORT` to change that.

With Docker:

```
docker compose up -d
```

The compose file mounts the source directory read-only into an `oven/bun` image and binds port 3460 on loopback. Put a reverse proxy in front for TLS. `index.html` is read per request, so edits are live. A `server.ts` change needs `docker compose restart`.
