import { WithdrawalRequest } from "../types";
import { createResourceApi } from "./resource";

export const withdrawalsApi = {
    ...createResourceApi<WithdrawalRequest>("withdrawals"),
    approve: (id: string | number) => createResourceApi("withdrawals").update(id, { status: "approved" }),
    reject: (id: string | number, reason: string) => createResourceApi("withdrawals").update(id, { status: "rejected", rejection_reason: reason }),
    complete: (id: string | number) => createResourceApi("withdrawals").update(id, { status: "completed" }),
};
