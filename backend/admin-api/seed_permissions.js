const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const permissionModules = [
  { key: "dashboard", readOnly: ["view"] },
  { key: "users" },
  { key: "id_verifications", disabled: ["create", "delete"] },
  { key: "voice_verifications", disabled: ["create", "delete"] },
  { key: "wallet", disabled: ["delete"] },
  { key: "referrals" },
  { key: "calls", disabled: ["create", "approve"] },
  { key: "chat", disabled: ["create", "approve"] },
  { key: "ratings", disabled: ["create", "approve"] },
  { key: "admin_roles" }
];

const permissionActions = ["view", "create", "edit", "delete", "approve"];

async function run() {
  const inserts = [];
  permissionModules.forEach((mod) => {
    permissionActions.forEach((action) => {
      const disabled = mod.disabled?.includes(action) || (mod.readOnly && !mod.readOnly.includes(action));
      if (!disabled) {
        inserts.push({ name: `${mod.key}.${action}`, description: `Allows ${action} on ${mod.key}` });
      }
    });
  });

  const res = await fetch(`${supabaseUrl}/rest/v1/permissions?on_conflict=name`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(inserts)
  });
  
  const text = await res.text();
  console.log("Status:", res.status, "Response:", text.substring(0, 200));
}

run();
