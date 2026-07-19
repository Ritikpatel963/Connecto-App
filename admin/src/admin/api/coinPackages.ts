import { CoinPackage } from "../types";
import { createResourceApi } from "./resource";

export const coinPackagesApi = createResourceApi<CoinPackage>("coin-packages");
