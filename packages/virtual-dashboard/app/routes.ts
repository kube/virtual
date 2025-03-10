import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/main.tsx", [
    index("routes/state.tsx"),
    route("/graphiql", "routes/graphiql.tsx"),
  ]),
  route("/api", "routes/api.ts"),
] satisfies RouteConfig;
