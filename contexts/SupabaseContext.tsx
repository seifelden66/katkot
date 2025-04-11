import { supabase } from "@/lib/supabaseClient";
import { createContext } from "react";

// Create auth/supabase context
export const SupabaseContext = createContext(null);

// In layout/page component:
<SupabaseContext.Provider value={supabase}>
  <App />
</SupabaseContext.Provider>