// Chat Text Size has no backend: the size lives in each browser, so the
// server entry only exists because BB requires one.
import type { BbPluginApi } from "@get-bb/plugin-sdk";

export default async function plugin(bb: BbPluginApi) {
  bb.log.info("loaded");
}
