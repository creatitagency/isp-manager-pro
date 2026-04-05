import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        <footer className="h-8 bg-white/60 border-t border-gray-100 px-6 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
          <span>ISP Manager Pro v2.0 — MooviTelecom</span>
          <span>Powered by Next.js + Vercel</span>
        </footer>
      </div>
    </div>
  );
}
