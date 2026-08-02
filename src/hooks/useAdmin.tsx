import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdmin = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAdmin = async () => {

      if (!userId) {
        if (active) {
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }


      setChecking(true);


      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();


      console.log("Admin check:", {
        userId,
        data,
        error
      });


      if (!active) return;


      setIsAdmin(!!data);
      setChecking(false);

    };


    checkAdmin();


    return () => {
      active = false;
    };

  }, [userId]);


  return {
    isAdmin,
    checking
  };
};