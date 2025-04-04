import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/home.tsx"),
    route("/docs", "routes/docs.tsx"),
    route("/demo", "routes/demo.tsx"),
  ]),
] satisfies RouteConfig;
