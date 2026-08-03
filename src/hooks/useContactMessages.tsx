import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export const useContactMessages = (enabled: boolean) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

      console.log("CONTACT MESSAGES:", data);
console.log("CONTACT ERROR:", error);
    if (!error) {
      setMessages(data || []);
    }

    setLoading(false);
  };


  useEffect(() => {
    if (enabled) {
      fetchMessages();
    }
  }, [enabled]);


  return {
    messages,
    loading,
    refresh: fetchMessages
  };
};