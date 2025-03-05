import { ServerBuild } from "react-router";
import type { VirtualServerAPI } from "./VirtualServerAPI";

export type LoadContext = {
  virtualAPI: VirtualServerAPI;
};

declare const assets: ServerBuild["assets"];
declare const assetsBuildDirectory: ServerBuild["assetsBuildDirectory"];
declare const basename: ServerBuild["basename"];
declare const future: ServerBuild["future"];
declare const prerender: ServerBuild["prerender"];
declare const publicPath: ServerBuild["publicPath"];
declare const routes: ServerBuild["routes"];
declare const ssr: ServerBuild["ssr"];
declare const isSpaMode: ServerBuild["isSpaMode"];
declare const entry: ServerBuild["entry"] & { module: { ASSETS_PATH: string } };
