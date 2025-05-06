"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Optional name
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("/api/auth/register", {
        email,
        password,
        name,
      });

      toast({
        title: "Registration Successful",
        description: "You can now log in with your credentials.",
      });
      router.push("/api/auth/signin"); // Redirect to sign-in page after successful registration
    } catch (error) {
      // Use more specific error typing below
      console.error("Registration failed:", error);
      let errorDesc = "An unexpected error occurred during registration.";
      // Check if it's an Axios error first
      if (axios.isAxiosError(error) && error.response) {
        // Use error message from backend if available
        const responseData = error.response.data;
        // Check if responseData is a string or an object with a message/error property
        if (typeof responseData === "string") {
          errorDesc = responseData;
        } else if (
          responseData &&
          (responseData.message || responseData.error)
        ) {
          errorDesc = responseData.message || responseData.error;
        } else {
          // Fallback if data structure is unexpected
          errorDesc = `Registration failed (Status: ${error.response.status}).`;
        }
        // Removed the redundant check below as the logic above handles it
        // if (typeof errorDesc !== "string") { ... }
      } else if (error instanceof Error) {
        // Handle generic Error objects
        errorDesc = error.message || errorDesc;
      }
      // Keep the generic message for other unknown error types

      toast({
        title: "Registration Failed",
        description: errorDesc,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Create a new account to start using the application.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                disabled={isLoading}
                // Add validation for password confirmation later
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Registering..." : "Register"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/api/auth/signin"
                className="underline hover:text-primary"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
