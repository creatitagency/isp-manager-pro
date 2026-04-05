"use client";
import { Bell, ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Panel de Mando",
  "/clientes": "Clientes",
  "/contratos": "Contratos",
  "/tarifas": "Tarifas",
  "/portabilidades": "Portabilidades",
  "/facturacion": "Facturación",
  "/cdrs": "CDRs",
  "/tickets": "Tickets",
  "/red": "Red / Infraestructura",
  "/almacen": "Almacén",
  "/reporting": "Reporting",
};

export default function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname || ""] || "Panel";

  return (
    <header className="h-[56px] bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-1.5 text-[13px]">
        <Home size={13} className="text-gray-400" />
        <ChevronRight size={12} className="text-gray-300" />
        <span className="font-semibold text-gray-900">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell size={17} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-400 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            JA
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-gray-900">José Arroyo</div>
            <div className="text-[11px] text-gray-400">Administrador</div>
          </div>
        </div>
      </div>
    </header>
  );
}
