import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdmin = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    setChecking(true);

    const check = async () => {
      // One-time bootstrap: the first signed-in account becomes admin.
      await supabase.rpc("claim_first_admin");

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!active) return;
      setIsAdmin(!!data);
      setChecking(false);
    };

    check();


    return () => {
      active = false;
    };
  }, [userId]);

  return { isAdmin, checking };
};
