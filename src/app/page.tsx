import Header from "@/components/header";
import QrGenerator from "@/components/qr-generator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <QrGenerator />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        Made with love for U
      </footer>
    </div>
  );
}
