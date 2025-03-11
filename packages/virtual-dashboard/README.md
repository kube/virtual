# Virtual Dashboard

A React Component that allows to control a VirtualServer.

## Usage as a React Component

```tsx
import fs from "node:fs/promises";
import { toStructype } from "@kube/structype-graphql";
import { VirtualServer } from "@kube/virtual";
import { VirtualDashboard } from "@kube/virtual-dashboard";

const schema = await fs
  .readFile("./path/to/schema.graphql", "utf8")
  .then(toStructype);

const virtualServer = new VirtualServer();

// This is still an early example.
// Ideally you could also communicate with a VirtualServer into another process/server, and this will imply another API.
export const App = () => {
  return <VirtualDashboard virtualServer={virtualServer} />;
};
```

### Usage as Server

```tsx
import http from "node:http";
import fs from "node:fs/promises";
import { VirtualServer } from "@kube/virtual";
import { createVirtualDashboardServer } from "@kube/virtual-dashboard/server";

const schema = await fs
  .readFile("./path/to/schema.graphql", "utf8")
  .then(toStructype);

// This is minimal, as it won't watch schema etc...
const virtualServer = new VirtualServer({ schema });

const virtualDashboardServer = new VirtualDashboardServer(virtualServer);

const server = http.createServer(virtualDashboardServer);

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
```
