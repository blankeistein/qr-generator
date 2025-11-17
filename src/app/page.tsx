import Header from "@/components/header";
import QrGenerator from "@/components/qr-generator";

export default function Home() {
  return (
    <div className="min-h-screen w-full relative">
      <div
        className="absolute inset-0 z-0 bg-dot-pattern"
        style={{
          backgroundSize: "20px 20px",
        }}
      />
      <Header />
      <main className="relative flex-grow container mx-auto px-4 py-8 z-1">
        <QrGenerator />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        Made with ❤️ for U
      </footer>
    </div>
  );
}
