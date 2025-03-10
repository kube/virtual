// @ts-check
import express from "express";
import { createServer } from "vite";

const PORT = 4000;

const app = express();

console.log("Starting development server");

const viteDevServer = await createServer({
  server: { middlewareMode: true },
});

app.use(viteDevServer.middlewares);

app.use(async (req, res, next) => {
  try {
    const source = await viteDevServer.ssrLoadModule("./dev/app.ts");
    return await source.app(req, res, next);
  } catch (error) {
    if (typeof error === "object" && error instanceof Error) {
      viteDevServer.ssrFixStacktrace(error);
    }
    next(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
