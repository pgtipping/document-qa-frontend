"use client";

import { useState, useEffect } from "react";
import {
  signIn,
  getProviders,
  LiteralUnion,
  ClientSafeProvider,
} from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BuiltInProviderType } from "next-auth/providers/index";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<Record<
    LiteralUnion<BuiltInProviderType>,
    ClientSafeProvider
  > | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/chat"; // Default redirect after login
  const error = searchParams?.get("error");

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  useEffect(() => {
    if (error) {
      let errorMessage = "An error occurred during sign in.";
      switch (error) {
        case "CredentialsSignin":
          errorMessage = "Invalid email or password. Please try again.";
          break;
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
        case "OAuthAccountNotLinked":
          errorMessage =
            "Error signing in with provider. Please try again or use a different method.";
          break;
        case "EmailSignin":
        case "SessionRequired":
          errorMessage =
            "There was an issue with your session. Please sign in again.";
          break;
        default:
          errorMessage = `Sign in failed: ${error}`;
      }
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Clear the error from the URL without reloading the page
      router.replace("/auth/signin", undefined);
    }
  }, [error, toast, router]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false, // Handle redirect manually based on result
      email,
      password,
      callbackUrl: callbackUrl,
    });

    setIsLoading(false);

    if (result?.error) {
      // Error is handled by the useEffect hook watching searchParams
      // Update URL to show error param, which useEffect will pick up
      router.push(
        `/auth/signin?error=${result.error}&callbackUrl=${encodeURIComponent(
          callbackUrl
        )}`
      );
    } else if (result?.ok) {
      // Successful sign in
      toast({
        title: "Sign In Successful",
        description: "Redirecting...",
      });
      router.push(callbackUrl); // Redirect to the intended page or default
    } else {
      // Handle unexpected non-error, non-ok result
      toast({
        title: "Sign In Failed",
        description: "An unexpected issue occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOAuthSignIn = (providerId: string) => {
    setIsLoading(true); // Show loading state for OAuth as well
    signIn(providerId, { callbackUrl });
    // No need to set isLoading false here, as the page will redirect
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4"
      data-testid="signin-page"
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl" data-testid="signin-title">
            Sign In
          </CardTitle>
          <CardDescription>
            Enter your credentials or use a provider to sign in.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCredentialsSubmit} data-testid="signin-form">
          <CardContent className="space-y-4">
            {providers?.credentials && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    data-testid="login-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    data-testid="login-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="login-submit-button"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isLoading ? "Signing In..." : "Sign In with Credentials"}
                </Button>
              </>
            )}
            {/* Divider */}
            {providers?.credentials &&
              Object.values(providers).filter((p) => p.id !== "credentials")
                .length > 0 && (
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
              )}

            {/* OAuth Providers */}
            <div className="space-y-2" data-testid="oauth-providers">
              {providers &&
                Object.values(providers).map((provider) => {
                  if (provider.id === "credentials") return null; // Skip credentials provider here
                  return (
                    <Button
                      key={provider.id}
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOAuthSignIn(provider.id)}
                      disabled={isLoading}
                      data-testid={`login-${provider.id}-button`}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Sign in with {provider.name}
                    </Button>
                  );
                })}
            </div>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          {/* Registration Link */}
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="underline hover:text-primary"
              data-testid="register-link"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
