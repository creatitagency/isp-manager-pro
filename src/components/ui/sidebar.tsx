"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, FileText, PhoneCall, Receipt, Wrench, RefreshCw,
  FileCheck, Server, Package, Tag, BarChart3, Globe, ChevronLeft,
  ChevronRight, Bell, Settings, LogOut, Search, CreditCard, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    title: "Principal",
    items: [
      { id: "dashboard", label: "Panel de Mando", icon: Home, href: "/dashboard" },
    ],
  },
  {
    title: "Comercial",
    items: [
      { id: "clientes", label: "Clientes", icon: Users, href: "/clientes" },
      { id: "contratos", label: "Contratos", icon: FileCheck, href: "/contratos" },
      { id: "tarifas", label: "Tarifas", icon: Tag, href: "/tarifas" },
      { id: "portas", label: "Portabilidades", icon: RefreshCw, href: "/portabilidades" },
    ],
  },
  {
    title: "Administración",
    items: [
      { id: "facturacion", label: "Facturación", icon: Receipt, href: "/facturacion" },
      { id: "cdrs", label: "CDRs", icon: PhoneCall, href: "/cdrs" },
    ],
  },
  {
    title: "Soporte",
    items: [
      { id: "tickets", label: "Tickets", icon: Wrench, href: "/tickets" },
    ],
  },
  {
    title: "Técnico",
    items: [
      { id: "red", label: "Red / Infra", icon: Server, href: "/red" },
      { id: "almacen", label: "Almacén", icon: Package, href: "/almacen" },
    ],
  },
  {
    title: "Análisis",
    items: [
      { id: "reporting", label: "Reporting", icon: BarChart3, href: "/reporting" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col bg-white/95 backdrop-blur-xl border-r border-gray-200/60 transition-all duration-300 ease-out shrink-0",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center border-b border-gray-100 px-4 h-[56px]", collapsed && "justify-center px-0")}>
        <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-500 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm">
          <Globe size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div className="ml-2.5 min-w-0">
            <div className="text-[13px] font-bold text-gray-900 tracking-tight">MooviTelecom</div>
            <div className="text-[10px] text-gray-400 font-medium">ISP Manager Pro</div>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2 px-3 py-[7px] bg-gray-100/80 rounded-lg">
            <Search size={13} className="text-gray-400" />
            <span className="text-[12px] text-gray-400">Buscar...</span>
            <kbd className="ml-auto text-[10px] text-gray-300 bg-white px-1.5 py-0.5 rounded border border-gray-200">⌘K</kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="px-3 pt-4 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
                {section.title}
              </div>
            )}
            {collapsed && <div className="h-2" />}
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    isActive ? "sidebar-item-active" : "sidebar-item",
                    collapsed && "justify-center px-0 mx-1"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={17} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.id === "tickets" && (
                    <span className="ml-auto text-[10px] bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                      3
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-2 space-y-0.5">
        {!collapsed && (
          <Link href="/portal" className="sidebar-item">
            <User size={17} />
            <span>Portal Cliente</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("sidebar-item w-full", collapsed && "justify-center px-0 mx-1")}
        >
          {collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span>Colapsar</span></>}
        </button>
      </div>
    </aside>
  );
}
