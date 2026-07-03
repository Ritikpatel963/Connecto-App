import { CallRecord } from "../types";
import { createResourceApi } from "./resource";
export const callsApi = createResourceApi<CallRecord>("calls");
