import React, { useState } from "react";
import { Cross, Key, Lock, Eye, EyeOff, X } from "lucide-react";
import { Card, Field, Input, Button } from "../components/ui";

export interface LoginProps {
  onLogin: (accessKey: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function Login({ onLogin, loading, error }: LoginProps) {
  const [accessKey, setAccessKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (accessKey.trim()) {
      onLogin(accessKey.trim());
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-4 font-sans">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary to-primary-hover shadow-[0_4px_20px_-4px_var(--primary)]">
            <Cross className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-[22px] font-bold text-foreground">ST JOSEPH CHURCH DEVAGIRI PARISH</h2>
          <p className="mt-1 font-mono text-[11px] font-bold tracking-wider text-primary uppercase">
            ADMINISTRATIVE SANCTUM PORTAL
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2.5 rounded-[8px] border border-danger/30 bg-danger/10 p-3 text-[12px] text-danger">
            <X className="h-4 w-4 shrink-0" />
            <span>Login Denied: {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Admin Access Key">
            <div className="relative flex items-center">
              <Key className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Enter administrator access key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="pl-9 pr-9 text-center font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                aria-label={showKey ? "Hide access key" : "Show access key"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Button type="submit" onClick={handleSubmit} disabled={loading} className="w-full py-2.5">
            <Lock className="h-4 w-4" />
            {loading ? "Authenticating..." : "Secure Administrator Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

