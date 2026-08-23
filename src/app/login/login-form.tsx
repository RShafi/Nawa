"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  login,
  signup,
  type AuthActionState,
} from "@/app/login/actions";

const initialState: AuthActionState = {};

type LoginFormProps = {
  next?: string;
};

export function LoginForm({ next = "/path" }: LoginFormProps) {
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signup, initialState);

  const error = loginState.error ?? signupState.error;
  const message = signupState.message;
  const pending = loginPending || signupPending;

  return (
    <form className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          placeholder="••••••••"
          disabled={pending}
        />
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="text-muted-foreground text-sm" role="status">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <Button type="submit" formAction={loginAction} className="flex-1" disabled={pending}>
          {loginPending ? "Signing in…" : "Log In"}
        </Button>
        <Button
          type="submit"
          formAction={signupAction}
          variant="outline"
          className="flex-1"
          disabled={pending}
        >
          {signupPending ? "Creating…" : "Create Account"}
        </Button>
      </div>
    </form>
  );
}
