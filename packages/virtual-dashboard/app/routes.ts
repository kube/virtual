import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/main.tsx", [
    index("routes/home.tsx"),
    route("/graphiql", "routes/graphiql.tsx"),
    route("/schema", "routes/schema.tsx"),
  ]),
] satisfies RouteConfig;
