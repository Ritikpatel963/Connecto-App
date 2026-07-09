import { CallRatePackage } from "../types";
import { createResourceApi } from "./resource";

export const packagesApi = createResourceApi<CallRatePackage>("packages");
