# Virtual

Tooling for prototyping, building, and testing frontend/SSR applications that consume GraphQL APIs.

This monorepo provides:

- A schema format (Structype) that mirrors GraphQL types with plain JSON/TS.
- Converters between Structype and GraphQL (AST and executable schema).
- A Virtual Server that executes GraphQL queries backed by default resolvers and live, editable state (“state files”).
- A React-based Dashboard with Monaco + GraphiQL to edit state and run queries in real time.
- A small CLI to transpile GraphQL SDL into Structype and (WIP) serve it.

## Repository layout

Monorepo managed with pnpm workspaces (see `pnpm-workspace.yaml`).

- `packages/structype`

  - Core type system for describing GraphQL-like schemas as plain objects (`Schema_*` types).
  - Serialization utilities to emit `.ts` or `.json` from a `Schema_Index`.

- `packages/structype-graphql`

  - `toGraphQL`/`toGraphqlSchema`: build GraphQL AST/executable schema from Structype.
  - `toStructype`: parse GraphQL SDL into Structype.
  - Vitest-powered round‑trip tests in `conversion.spec.ts`.

- `packages/virtual`

  - Runtime “Virtual Server” to execute GraphQL against a Structype schema.
  - Merges generated “default resolvers” with user-defined resolvers compiled from state files.
  - Exposes an HTTP request handler for a minimal control plane (SSE events, command endpoints, GraphQL execution).

- `packages/virtual-dashboard`

  - React component (`<VirtualDashboard />`) that connects to a Virtual Server.
  - Monaco integration that injects types for authoring state files with autocomplete/typing.
  - GraphiQL editor to run queries and see results.

- `packages/virtual-cli`

  - `vgql generate`: merge multiple SDL files and transpile to Structype (optionally write to disk, watch mode).
  - `vgql serve`: WIP stub of a local server.

- `website`

  - Playground/documentation site (Vite) that can embed the dashboard.

- `__dev/`
  - Local development fixtures: a sample `schema.graphql` and an example `states/hello.state.ts`.

## High-level architecture

```mermaid
flowchart TD
  A[GraphQL SDL]
  B[Structype (Schema_Index)]
  C[GraphQL Executable Schema]
  D[Virtual Server]
  R1[(Default resolvers\n(type-driven))]
  R2[(Compiled state file\nresolvers)]
  E[/HTTP(S) control plane\n/_virtual/*/]
  F[Virtual Dashboard\n(React: Monaco + GraphiQL)]

  A -- "toStructype" --> B
  B -- "toGraphQL / toGraphqlSchema" --> C
  C --> D

  R1 --> D
  R2 --> D

  D -- "HTTP(S)" --> E
  E -- "SSE events" --> F
  F -- "fetch/emit" --> E
```

## Core concepts

### Structype schema

The Structype model (`packages/structype/src/Schema.ts`) captures GraphQL types in plain objects:

- Records, Interfaces, Enums, Unions, Inputs, Scalars
- Primitives (`string`, `number[int]`, `boolean`, `id`), Arrays, Named references

It serializes cleanly to JSON/TS via `serialize(schema, format)`.

### Converters

- `toStructype(sdl: string): Schema_Index` parses SDL into Structype.
- `toGraphQL(index: Schema_Index): DocumentNode` builds a GraphQL AST.
- `toGraphqlSchema(index: Schema_Index): GraphQLSchema` builds an executable schema.

Round‑trip tests in `packages/structype-graphql/src/conversion.spec.ts` assure parity for supported features.

### Virtual Server

File: `packages/virtual/src/VirtualServer.ts`.

Responsibilities:

- Hold the current `Schema_Index` and generate an executable `GraphQLSchema` with `@graphql-tools/schema`.
- Produce “default resolvers” (see `createDefaultResolvers.ts`) for every field based on type defaults:
  - strings → "\_", numbers → `1`/`1.5`, booleans → `false`, arrays → `[]`, enums → first value, IDs → "0", records → `{ __typename }`, unions → default to first member, etc.
- Load user resolvers from “state files” that are compiled on the fly.
  - A state file exports `default VirtualState(options, stateFn)`; options have primitive types (Boolean/Number/String) and feed into `stateFn` which returns resolvers.
  - Compilation uses an in‑memory data URL and dynamic import (no sandbox; dev‑only).
- Merge default resolvers + state resolvers into the executable schema.
- Execute queries via `resolve(query, variables?)`.
- Maintain and broadcast events via a simple pub/sub (SSE on the HTTP layer).

HTTP control plane (see `createRequestHandler.ts`):

- `GET /_virtual/initial` → initial payload `{ schema, stateFiles, currentStateFile }`.
- `GET /_virtual/events` → Server‑Sent Events stream of changes.
- `POST /_virtual/emit` → commands:
  - `statefile_select`, `statefile_create`, `statefile_update`, `statefile_delete`, `statefile_option_update`.
- `POST /_virtual/graphql` → execute query: `{ query }`.

Remote usage: `createVirtualServer.fromHttpServer(url)` returns a `VirtualServerRemote` that talks to these endpoints (fetch/EventSource) and exposes the same read/command surface except mutation acknowledgements are event‑driven.

### Virtual Dashboard (React)

Files under `packages/virtual-dashboard`.

Composition:

- `VirtualDashboard.tsx` wires contexts and routes.
- `contexts/Monaco.tsx` provides the Monaco instance.
- `lib/loadVirtualLibsIntoMonaco.ts` injects type definitions into Monaco:
  - Loads `.d.ts` from `@kube/*` packages and creates a virtual `__virtual.d.ts` exposing the strongly‑typed `VirtualState` factory bound to the live schema (`__VirtualSchema`).
- `contexts/Virtual.tsx` and `contexts/VirtualDashboard.tsx` orchestrate Virtual Server state, Monaco models for each state file, dirty tracking, and GraphiQL schema/fetcher wiring.
- `routes/graphiql.tsx` provides a minimal editor/result pane; listens for server events to re‑run the current query on changes.

## Typical data flow

1. Provide a GraphQL schema (SDL) and convert it to Structype.
2. Create a Virtual Server with the Structype index and initial state files.
3. Mount the request handler on your HTTP server to expose `/_virtual/*` endpoints.
4. Use `<VirtualDashboard />` against a `VirtualServerRemote` or embed your own UI using the same endpoints.
5. Edit state files in the dashboard; they recompile and update resolvers live; GraphQL queries immediately reflect the changes.

## Minimal usage examples

### 1) Create a Virtual Server and HTTP handler

```ts
import { createServer } from "http";
import connect from "connect";
import { toStructype } from "@kube/structype-graphql";
import { createVirtualServer } from "@kube/virtual";
import { createRequestHandler } from "@kube/virtual/createRequestHandler";
import fs from "node:fs/promises";

const sdl = await fs.readFile("./schema.graphql", "utf8");
const schema = toStructype(sdl);

const virtual = createVirtualServer({
  schema,
  initialStateFiles: [
    {
      path: "hello.state.ts",
      content: `export default VirtualState({ greeting: { type: "String" } }, (o) => ({ resolvers: { Query: { hello: () => o.greeting } } }))`,
    },
  ],
  api: {
    async createStateFile(file) {
      /* persist if desired */
      virtual.createdStateFile(file);
    },
    async updateStateFile(file) {
      /* persist */
      virtual.updatedStateFile(file);
    },
    async deleteStateFile({ path }) {
      /* persist */
      virtual.deletedStateFile(path);
    },
  },
});

const app = connect();
app.use(createRequestHandler(virtual));

createServer(app).listen(4000);
```

### 2) Connect the Dashboard (remote)

```tsx
import { createRoot } from "react-dom/client";
import { VirtualDashboard } from "@kube/virtual-dashboard";
import { createVirtualServer } from "@kube/virtual";

const virtualServer = await createVirtualServer.fromHttpServer(
  "http://localhost:4000/"
);

createRoot(document.getElementById("root")!).render(
  <VirtualDashboard virtualServer={virtualServer} />
);
```

## State files (VirtualState)

State files are TypeScript modules that export a default `VirtualState` factory call. Example from `__dev/states/hello.state.ts`:

```ts
export default VirtualState(
  {
    formal: { type: "Boolean" },
    firstName: { type: "String" },
    age: { type: "Number" },
  },
  (opts) => ({
    resolvers: {
      Query: {
        hello: () =>
          `${opts.formal ? "Hello" : "Hi"} ${opts.firstName}! You are ${
            opts.age
          } years old.`,
        world: () => opts.age,
      },
    },
  })
);
```

At runtime, the dashboard injects `type __VirtualSchema = …` and `const VirtualState: VirtualStateConstructor<__VirtualSchema>` into Monaco, so your resolvers are type‑checked against the live schema.

## Development

- Install: `pnpm install`
- Build all packages: `pnpm build`
- Dev (typecheck/watch all): `pnpm dev`
- Test: `pnpm -r test`

Notes:

- TypeScript across packages (`type: module`).
- Vite is used by the dashboard and website for bundling/dev.
- Vitest for unit tests.

## Limitations and notes

- Virtual Server compilation of state files uses dynamic `import()` of a data URL. This is convenient for dev, not hardened for untrusted code.
- Default resolvers are type‑driven fallbacks; they don’t model business logic—override via state files as needed.
- Supported GraphQL features are those covered by the Structype model and tests; directives, subscriptions, custom validation, etc. are out of scope for now.
- The CLI `serve` command is a stub; prefer wiring `createRequestHandler` into your own server for now.

## Where to look next

- `packages/virtual/src/VirtualServer.ts` – server core and event model.
- `packages/virtual/src/createRequestHandler.ts` – HTTP control plane.
- `packages/virtual-dashboard/src/lib/loadVirtualLibsIntoMonaco.ts` – Monaco typing injection.
- `packages/structype-graphql/src/conversion.spec.ts` – conversion test cases.

Contributions welcome. MIT licensed.
