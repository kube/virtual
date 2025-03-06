import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/main.tsx", [
    index("routes/home.tsx"),
    route("/state", "routes/state.tsx"),
    route("/schema", "routes/schema.tsx"),
    route("/graphiql", "routes/graphiql.tsx"),
  ]),
] satisfies RouteConfig;
