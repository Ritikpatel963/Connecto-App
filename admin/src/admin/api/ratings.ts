import { BaseRecord } from "../types";
import { createResourceApi } from "./resource";
export const ratingsApi = createResourceApi<BaseRecord>("ratings");
