"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth";
import { Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await loginAction(email, password);
        toast.success("Logged in successfully");
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        toast.error(message);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {" "}
      <div className="w-full max-w-sm space-y-6">
        {" "}
        <div className="text-center space-y-2">
          {" "}
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            {" "}
            <Monitor className="h-8 w-8" />{" "}
            <span className="font-heading text-2xl font-bold">
              IT Helpdesk
            </span>{" "}
          </div>{" "}
          <p className="text-muted-foreground text-sm">
            {" "}
            IT Helpdesk & Asset Management{" "}
          </p>{" "}
        </div>{" "}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-border rounded-md bg-card p-6"
        >
          {" "}
          <h2 className="font-heading font-semibold text-lg">Sign In</h2>{" "}
          <div className="space-y-1.5">
            {" "}
            <Label
              htmlFor="email"
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              {" "}
              Email{" "}
            </Label>{" "}
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />{" "}
          </div>{" "}
          <div className="space-y-1.5">
            {" "}
            <Label
              htmlFor="password"
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              {" "}
              Password{" "}
            </Label>{" "}
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isPending}
            />{" "}
          </div>{" "}
          <Button type="submit" className="w-full" disabled={isPending}>
            {" "}
            {isPending ? "Loading..." : "Sign In"}{" "}
          </Button>{" "}
          <p className="text-center text-sm text-muted-foreground">
            {" "}
            No account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              {" "}
              Sign up{" "}
            </Link>{" "}
          </p>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
}
