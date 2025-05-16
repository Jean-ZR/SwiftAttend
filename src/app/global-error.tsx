
"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
          <div className="text-center space-y-4 max-w-md p-8 bg-card shadow-xl rounded-lg border border-destructive">
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-destructive">Oops! Something went wrong.</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. We apologize for the inconvenience.
              You can try to refresh the page or go back.
            </p>
            {process.env.NODE_ENV === 'development' && error?.message && (
              <pre className="mt-2 p-2 text-xs bg-muted rounded-md text-left overflow-auto max-h-40">
                Error: {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            )}
            <Button 
              onClick={() => {
                if (typeof reset === 'function') {
                  reset();
                } else {
                  // Fallback if reset is not a function (which is unexpected)
                  console.error("GlobalError: reset prop was not a function. Attempting page reload.");
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }
              }} 
              variant="destructive"
            >
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
