import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  const logo = PlaceHolderImages.find((img) => img.id === "logo");

  return (
    <header className="relative z-10 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 font-headline text-2xl font-bold text-foreground">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                >
                    <rect width="5" height="5" x="3" y="3" rx="1" />
                    <rect width="5" height="5" x="16" y="3" rx="1" />
                    <rect width="5" height="5" x="3" y="16" rx="1" />
                    <path d="M16 16h2a2 2 0 0 0 2-2v-2" />
                    <path d="M16 8h4" />
                    <path d="M8 16v4" />
                    <path d="M8 8v2a2 2 0 0 1-2 2H4" />
                </svg>
                QR Generator
             </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
