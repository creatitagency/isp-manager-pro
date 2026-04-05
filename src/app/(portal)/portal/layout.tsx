/**
 * Customer Portal Layout — Área de Cliente
 * Clean Apple-inspired design for end customers
 */
import Link from "next/link";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-500 rounded-[10px] flex items-center justify-center shadow-sm">
              <span className="text-white text-[11px] font-bold">MT</span>
            </div>
            <span className="text-[15px] font-bold text-gray-900">Mi MooviTelecom</span>
          </div>
          <nav className="flex items-center gap-1">
            {[
              { href: "/portal", label: "Inicio" },
              { href: "/portal/consumo", label: "Mi consumo" },
              { href: "/portal/facturas", label: "Facturas" },
              { href: "/portal/perfil", label: "Mi perfil" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button className="text-[13px] text-gray-500 hover:text-gray-700 font-medium">
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-[12px] text-gray-400">
          <span>© 2026 MooviTelecom. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-600">Aviso legal</a>
            <a href="#" className="hover:text-gray-600">Privacidad</a>
            <a href="#" className="hover:text-gray-600">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
