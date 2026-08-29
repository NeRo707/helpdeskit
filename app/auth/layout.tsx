import { Monitor } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <Monitor className="h-8 w-8" />
            <span className="font-heading text-2xl font-bold">IT Helpdesk</span>
          </div>
          <p className="text-muted-foreground text-sm">
            IT Helpdesk & Asset Management
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
