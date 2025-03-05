import "react-router";
import type { VirtualServerAPI } from "types/VirtualServerAPI.js";

declare module "react-router" {
  interface AppLoadContext {
    virtualAPI: VirtualServerAPI;
  }
}
