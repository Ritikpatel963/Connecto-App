import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://whypwqhdfxtjjenkhkwt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3tvF2hOnQ_slfiK4dVgzVw_oSnDZpnJ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
