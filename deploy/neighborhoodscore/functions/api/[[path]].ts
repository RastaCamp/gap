import { handleApiRequest } from "../../worker/router";
import type { WorkerEnv } from "../../worker/env";

export const onRequest: PagesFunction<WorkerEnv> = async (context) => {
  return handleApiRequest(context.request, context.env);
};
