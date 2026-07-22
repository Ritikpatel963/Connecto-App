const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const permissionModules = [
  { key: "packages" },
  { key: "cms" },
  { key: "settings" }
];

const permissionActions = ["view", "create", "edit", "delete", "approve"];

async function run() {
  const inserts = [];
  permissionModules.forEach((mod) => {
    permissionActions.forEach((action) => {
      inserts.push({ name: `${mod.key}.${action}`, description: `Allows ${action} on ${mod.key}` });
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
  console.log("Status:", res.status, "Response length:", text.length);
}

run();
