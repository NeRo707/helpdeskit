"use client";

import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

const ErrorComponent = ({ error, reset }: ErrorProps) => {
  return (
    <div className="text-center space-y-4 border border-border rounded-md bg-card p-6">
      <div className="flex flex-col items-center gap-2">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="font-heading font-semibold text-lg">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. You can try again or head back to login.
          <br />
          <br />
          <span className="text-xs text-destructive">{error.message}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          className="w-full"
        >
          Try again
        </Button>
      </div>
    </div>
  );
};

export default ErrorComponent;
