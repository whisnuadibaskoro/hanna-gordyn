const { createClient } =
require("@supabase/supabase-js");

if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_KEY
) {
    throw new Error(
        "SUPABASE_URL atau SUPABASE_KEY belum diatur"
    );
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

module.exports = supabase;