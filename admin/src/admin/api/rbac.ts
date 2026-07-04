import { BaseRecord } from "../types";
import { request } from "./client";
import { mockStore } from "./mockStore";
import { createResourceApi } from "./resource";

export const adminsApi = createResourceApi<BaseRecord>("admins");
export const rolesApi = createResourceApi<BaseRecord>("roles");
export const permissionsApi = createResourceApi<BaseRecord>("permissions");

export const rolePermissionsApi = {
  ...createResourceApi<BaseRecord>("role-permissions"),
  matrix: () => request<BaseRecord[]>({ url: "/role-permissions/matrix", method: "GET" }, () => mockStore.rows("role-permissions")),
  saveMatrix: (assignments: BaseRecord[]) => request<BaseRecord[]>(
    { url: "/role-permissions/matrix", method: "PATCH", data: { assignments } },
    () => assignments
  ),
};
