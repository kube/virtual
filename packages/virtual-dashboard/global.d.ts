import type { VirtualServerAPI } from "@kube/virtual";
import "react-router";

declare module "react-router" {
  interface AppLoadContext {
    virtualAPI: VirtualServerAPI;
  }
}
