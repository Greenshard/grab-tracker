// Local proxy for Grab share-location links. api.grab.com rejects browser
// requests from any origin other than sharelocation.grab.com, so the page
// fetches through here.
const PORT = Number(process.env.PORT ?? 3471);
const HOST = process.env.HOST ?? "127.0.0.1";
const page = Bun.file(new URL("./index.html", import.meta.url));

Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    const api = pathname.match(/^\/api\/([A-Za-z0-9]+)$/);
    if (api) {
      try {
        const res = await fetch(
          `https://api.grab.com/api/v1/safety/sharemyride/${api[1]}/bookingdetails?fullData=true`,
          { headers: { "User-Agent": "Mozilla/5.0" } },
        );
        return new Response(await res.text(), {
          status: res.status,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      } catch (err) {
        return Response.json({ error: String(err) }, { status: 502 });
      }
    }

    if (pathname === "/" || /^\/o\/[A-Za-z0-9]+$/.test(pathname)) {
      return new Response(page, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`grab-tracker on http://localhost:${PORT}/o/<token>`);
