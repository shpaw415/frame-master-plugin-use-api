import type { FrameMasterConfig } from "frame-master/server/types";
import type { FrameMasterPlugin } from "frame-master/plugin";
import UseApi from "frame-master-plugin-use-api";

export default {
  HTTPServer: {
    port: 3001,
  },
  plugins: [UseApi({ basePath: "api" }) as FrameMasterPlugin],
} satisfies FrameMasterConfig;
