// Supabase config
const SUPABASE_URL = "https://oaekqkpkwzopodzoryyp.supabase.co";
const SUPABASE_KEY = "sb_publishable_N2BNV3jxI-EXY3Z0kDELpw_E4sprVNp";

// Opprett Supabase-klient
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
