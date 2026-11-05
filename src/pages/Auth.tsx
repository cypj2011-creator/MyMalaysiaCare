import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Leaf, UserRound } from "lucide-react";

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"
    />
  </svg>
);

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const friendlyError = (message: string, code?: string) => {
    const m = (message || "").toLowerCase();
    if (code === "weak_password" || m.includes("pwned") || m.includes("leaked") || m.includes("weak password") || m.includes("compromised")) {
      return "That password has appeared in known data breaches. Please choose a stronger, unique password (mix of letters, numbers & symbols).";
    }
    if (code === "invalid_credentials" || m.includes("invalid login")) {
      return "Wrong email or password. If you don't have an account yet, tap Sign Up.";
    }
    if (m.includes("already registered") || m.includes("user already") || code === "user_already_exists") {
      return "This email is already registered. Try signing in instead.";
    }
    if (m.includes("email") && m.includes("invalid")) {
      return "Please enter a valid email address.";
    }
    if (code === "over_email_send_rate_limit" || m.includes("rate limit")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    return message || "Something went wrong. Please try again.";
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({

      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: friendlyError(error.message, (error as any).code),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // If email confirmation is required, no session is returned — try signing in anyway
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (signInError) {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account, then sign in.",
        });
        setLoading(false);
        return;
      }
    }

    toast({
      title: "Welcome!",
      description: "Account created successfully. You're now logged in.",
    });
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: friendlyError(error.message, (error as any).code),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);

    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      toast({
        title: "Google sign in failed",
        description: friendlyError(result.error.message, (result.error as any).code),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (result.redirected) return; // browser is heading to Google

    toast({
      title: "Welcome!",
      description: "You're signed in with Google.",
    });
    setLoading(false);
  };

  const handleGuest = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      toast({
        title: "Guest sign in failed",
        description: friendlyError(error.message, (error as any).code),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed in as guest",
        description: "You're browsing anonymously. Your scans are saved to this guest account.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-start justify-center paper-grain px-4 pt-6 pb-10">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t("welcome")}</CardTitle>
          <CardDescription>{t("authSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("signUpButton")}</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t("email")}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t("password")}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : t("signInButton")}
                </Button>
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Protected And Secured By Supabase
                </p>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("email")}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("password")}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : t("signUpButton")}
                </Button>
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Protected And Secured By Supabase
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={handleGoogle}
          >
            <GoogleIcon />
            {t("continueWithGoogle")}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-3"
            disabled={loading}
            onClick={handleGuest}
          >
            <UserRound className="w-4 h-4 mr-2" />
            Continue as Guest
          </Button>
          <p className="text-center text-sm text-muted-foreground pt-2">
            No email needed. You can create a full account later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;