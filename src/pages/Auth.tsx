import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tent, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();


  useEffect(() => {

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {

        if (event === "PASSWORD_RECOVERY") {
          setIsRecovery(true);
          return;
        }

        if (session) {
          navigate("/admin");
        }

      });


    supabase.auth.getSession().then(({ data: { session } }) => {

      if (session && !isRecovery) {
        navigate("/admin");
      }

    });


    return () => subscription.unsubscribe();

  }, [navigate, isRecovery]);



  const handlePasswordReset = async (e: React.FormEvent) => {

    e.preventDefault();


    if (newPassword.length < 6) {

      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });

      return;
    }


    setLoading(true);


    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });


    if (error) {

      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });


    } else {

      toast({
        title: "Password Updated",
        description: "Now you can login with your new password.",
      });


      setIsRecovery(false);
      setNewPassword("");

    }


    setLoading(false);

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();


    const validation = loginSchema.safeParse({
      email,
      password
    });


    if (!validation.success) {

      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });

      return;

    }


    setLoading(true);


    try {


      if (isLogin) {


        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });


        if (error) {

          toast({
            title: "Login Failed",
            description:
              error.message === "Invalid login credentials"
                ? "Invalid email or password. Please try again."
                : error.message,
            variant: "destructive",
          });

        }



      } else {


        const { error } =
          await supabase.auth.signUp({

            email,
            password,

            options: {

              emailRedirectTo:
                `${window.location.origin}/auth`

            },

          });



        if (error) {


          toast({

            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",

          });


        } else {


          toast({

            title: "Check Your Email",
            description:
              "We've sent you a confirmation link.",

          });


        }

      }


    } catch {


      toast({

        title: "Error",
        description:
          "Something went wrong. Please try again.",
        variant: "destructive",

      });


    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-foreground flex items-center justify-center px-6">

      <motion.div

        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.6 }}

        className="w-full max-w-sm"

      >


        <div className="text-center mb-10">

          <div className="flex items-center justify-center gap-2 mb-6">

            <Tent className="h-5 w-5 text-primary" />

            <span className="text-sm font-normal tracking-wide text-background">
              Wild Haven
            </span>

          </div>


          <h1 className="text-2xl font-light text-background mb-2">

            {isRecovery
              ? "Reset Password"
              : isLogin
              ? "Admin Login"
              : "Create Account"}

          </h1>


        </div>



        {
          isRecovery ? (


            <form
              onSubmit={handlePasswordReset}
              className="space-y-5"
            >


              <div className="space-y-2">

                <Label className="text-background">
                  New Password
                </Label>


                <Input

                  type="password"

                  value={newPassword}

                  onChange={(e)=>
                    setNewPassword(e.target.value)
                  }

                  placeholder="Enter new password"

                  required

                />

              </div>



              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full"
              >

                {loading
                  ? "Updating..."
                  : "Update Password"}

              </Button>


            </form>



          ) : (


            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >


              <div className="space-y-2">

                <Label className="text-background">
                  Email
                </Label>


                <Input

                  type="email"

                  value={email}

                  onChange={(e)=>
                    setEmail(e.target.value)
                  }

                  required

                />

              </div>



              <div className="space-y-2">

                <Label className="text-background">
                  Password
                </Label>


                <Input

                  type="password"

                  value={password}

                  onChange={(e)=>
                    setPassword(e.target.value)
                  }

                  required

                />

              </div>



              <Button

                type="submit"

                disabled={loading}

                className="w-full rounded-full"

              >

                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}

              </Button>



            </form>


          )
        }




        {!isRecovery && (

          <>


          <div className="mt-8 text-center">

            <button

              onClick={() => setIsLogin(!isLogin)}

              className="text-xs text-background/50"

            >

              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}

            </button>


          </div>



          <div className="mt-6 flex flex-col items-center gap-4">


            <Button

              onClick={() =>
                navigate("/admin?demo=true")
              }

              className="w-full rounded-full"

            >

              Try Demo Mode

            </Button>



            <button

              onClick={() => navigate("/")}

              className="text-xs text-background/40 flex items-center gap-1"

            >

              <ArrowLeft className="h-3 w-3" />

              Back to site

            </button>


          </div>


          </>

        )}



      </motion.div>

    </div>

  );

};


export default Auth;