import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SettingsMenu } from "@/features/settings/components/SettingsMenu";
import { useApplyTheme } from "@/lib/settings/useApplyTheme";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  useApplyTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link to="/" className="text-sm font-semibold">
          Dataroom
        </Link>
        <SettingsMenu />
      </header>
      <main>{children}</main>
    </div>
  );
}
