import type { PluginClientContext } from "@getpaseo/plugin/client";
import { installDropPath } from "./client/web";

export default function contribute(_client: PluginClientContext) {
  return installDropPath();
}
