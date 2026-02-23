import { createClient } from "@supabase/supabase-js";
import type { Database } from "./db-types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
