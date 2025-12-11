"use-api";

import type { masterRequest } from "frame-master/server/request";

export async function GET(master: masterRequest) {
  console.log("GET /api");
  master.setResponse("Hello from GET /api");
}
