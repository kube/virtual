import type { VirtualServerAPI } from "@kube/virtual";
import { createContext } from "react";

export const VirtualContext = createContext<VirtualServerAPI>({} as any);
