import { supabase } from "../../lib/supabase";

export const settingsApi = {
  // Fetch a specific setting by key
  get: async (key: string) => {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw new Error(error.message);
    }
    
    return data ? data.value : null;
  },

  // Update or insert a setting
  set: async (key: string, value: any) => {
    const { data, error } = await supabase
      .from("settings")
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};
