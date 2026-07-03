import { Verification } from "../types";
import { resourceAction } from "./client";
import { createResourceApi } from "./resource";

const idBase = createResourceApi<Verification>("id-verifications");
const voiceBase = createResourceApi<Verification>("voice-verifications");

const actions = (resource: string) => ({
  approve: (id: string | number) => resourceAction<Verification>(resource, id, "approve", {}, { status: "approved", reviewed_by_admin: "Neha Verma", reviewed_at: new Date().toISOString() }),
  reject: (id: string | number, rejection_reason: string) => resourceAction<Verification>(resource, id, "reject", { rejection_reason }, { status: "rejected", rejection_reason, reviewed_by_admin: "Neha Verma", reviewed_at: new Date().toISOString() }),
});

export const idVerificationsApi = { ...idBase, ...actions("id-verifications") };
export const voiceVerificationsApi = { ...voiceBase, ...actions("voice-verifications") };
