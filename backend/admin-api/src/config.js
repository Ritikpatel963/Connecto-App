const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

export const config = {
  port: Number(process.env.ADMIN_API_PORT || 4100),
  adminOrigin: required("ADMIN_PANEL_ORIGIN"),
  supabaseUrl: required("SUPABASE_URL").replace(/\/$/, ""),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
};
