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
  .select("*")
  .eq("user_id", userId);

console.log("Admin check:", {
  userId,
  data,
  error,
});


      if (!active) return;


      setIsAdmin(data && data.length > 0);
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