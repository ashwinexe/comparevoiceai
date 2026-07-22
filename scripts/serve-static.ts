import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const staticRoot = path.join(projectRoot, "dist");
const host = process.env.PREVIEW_HOST ?? "127.0.0.1";
const requestedPort = Number.parseInt(process.env.PORT ?? "4173", 10);
const port = Number.isFinite(requestedPort) ? requestedPort : 4173;

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function commonHeaders(filePath: string) {
  const immutableAsset = filePath.includes(`${path.sep}assets${path.sep}`) && /-[A-Za-z0-9_-]{8,}\./.test(path.basename(filePath));
  return {
    "Cache-Control": immutableAsset ? "public, max-age=31536000, immutable" : "no-cache",
    "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

function parseByteRange(rangeHeader: string, size: number): { start: number; end: number } | null {
  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
  if (!match || (!match[1] && !match[2])) return null;

  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    return { start: Math.max(size - suffixLength, 0), end: size - 1 };
  }

  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(requestedEnd) ||
    start < 0 ||
    start >= size ||
    requestedEnd < start
  ) return null;

  return { start, end: Math.min(requestedEnd, size - 1) };
}

async function sendFile(response: ServerResponse, filePath: string, method: string, statusCode = 200, rangeHeader?: string) {
  const fileStat = await stat(filePath);
  let start = 0;
  let end = fileStat.size - 1;
  let responseStatus = statusCode;
  const headers: Record<string, string | number> = {
    ...commonHeaders(filePath),
    "Accept-Ranges": "bytes",
    "Content-Length": fileStat.size,
  };

  if (rangeHeader && statusCode === 200) {
    const range = parseByteRange(rangeHeader, fileStat.size);
    if (!range) {
      response.writeHead(416, {
        ...commonHeaders(filePath),
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes */${fileStat.size}`,
        "Content-Length": 0,
      });
      response.end();
      return;
    }
    ({ start, end } = range);
    responseStatus = 206;
    headers["Content-Range"] = `bytes ${start}-${end}/${fileStat.size}`;
    headers["Content-Length"] = end - start + 1;
  }

  response.writeHead(responseStatus, headers);
  if (method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(filePath, { start, end }).pipe(response);
}

async function pathType(filePath: string) {
  try {
    return await stat(filePath);
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method not allowed");
      return;
    }

    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    let pathname: string;
    try {
      pathname = decodeURIComponent(requestUrl.pathname);
    } catch {
      response.writeHead(400);
      response.end("Bad request");
      return;
    }

    const relativePath = pathname.replace(/^\/+/, "");
    const candidate = path.resolve(staticRoot, relativePath);
    if (candidate !== staticRoot && !candidate.startsWith(`${staticRoot}${path.sep}`)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const candidateStat = await pathType(candidate);
    if (candidateStat?.isDirectory()) {
      if (pathname !== "/" && !pathname.endsWith("/")) {
        response.writeHead(308, { Location: `${pathname}/${requestUrl.search}` });
        response.end();
        return;
      }
      const indexPath = path.join(candidate, "index.html");
      if ((await pathType(indexPath))?.isFile()) {
        await sendFile(response, indexPath, request.method, 200, request.headers.range);
        return;
      }
    } else if (candidateStat?.isFile()) {
      await sendFile(response, candidate, request.method, 200, request.headers.range);
      return;
    }

    const notFoundPath = path.join(staticRoot, "404.html");
    await sendFile(response, notFoundPath, request.method, 404);
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal server error");
  }
});

server.listen(port, host, () => {
  console.log(`Static preview: http://${host}:${port}/ (document root: ${staticRoot})`);
});
