import { BaseRecord } from "../types";
import { createResourceApi } from "./resource";
export const conversationsApi = createResourceApi<BaseRecord>("conversations");
export const messagesApi = createResourceApi<BaseRecord>("messages");
