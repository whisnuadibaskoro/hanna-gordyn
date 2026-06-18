const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL) {
    throw new Error("SUPABASE_URL tidak ditemukan");
}

if (!process.env.SUPABASE_KEY) {
    throw new Error("SUPABASE_KEY tidak ditemukan");
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

module.exports = supabase;