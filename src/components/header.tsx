import { QrCode } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <header className="relative z-10 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-headline text-2xl font-bold text-foreground">
              <QrCode className="h-7 w-7 text-primary" />
              QR Generator
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
