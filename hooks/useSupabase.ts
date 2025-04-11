import { SupabaseContext } from "@/contexts/SupabaseContext";
import { useContext } from "react";

export const useSupabase = () => {
  const supabase = useContext(SupabaseContext);
  if (!supabase) throw new Error('Missing SupabaseProvider');
  return supabase;
};