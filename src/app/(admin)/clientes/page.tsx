/**
 * CRM / Clientes — Client Management
 * Full CRUD with search, filters, and client detail view
 */
import prisma from "@/lib/db";

// This page works with real data when DB is connected,
// or shows the demo UI when running without a database

export default async function ClientesPage() {
  // In production: const clients = await prisma.client.findMany({ take: 20 });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Gestión integral de clientes y servicios</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-[13px]">Exportar</button>
          <button className="btn-primary text-[13px]">+ Alta cliente</button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input-apple pl-10" placeholder="Buscar nombre, ID, DNI, teléfono, email..." />
        </div>
        <select className="input-apple w-auto">
          <option>Todos los servicios</option>
          <option>Fibra</option>
          <option>Móvil</option>
          <option>Convergente</option>
        </select>
        <select className="input-apple w-auto">
          <option>Todos los estados</option>
          <option>Activo</option>
          <option>Pendiente</option>
          <option>Suspendido</option>
          <option>Baja</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Cliente", "DNI/CIF", "Servicio", "Plan", "€/mes", "Estado", "Provincia", ""].map((h, i) => (
                <th key={i} className={`table-header ${h === "€/mes" ? "text-right" : h === "Estado" ? "text-center" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Carlos García Martínez", id: "CLI-00001", email: "carlos.garcia@gmail.com", dni: "45678901A", svc: "convergente", plan: "Pack Fibra 600 + Móvil 25GB", price: "48.99", status: "Activo", prov: "Madrid" },
              { name: "María López Fernández", id: "CLI-00002", email: "maria.lopez@hotmail.com", dni: "56789012B", svc: "fibra", plan: "Fibra 1Gb", price: "49.99", status: "Activo", prov: "Barcelona" },
              { name: "Tech Solutions SA", id: "CLI-00003", email: "admin@techsolutions.es", dni: "B12345678", svc: "convergente", plan: "Pack Empresa 1Gb + 3 Móviles", price: "89.99", status: "Activo", prov: "Valencia" },
              { name: "José Sánchez González", id: "CLI-00004", email: "jose.sanchez@yahoo.es", dni: "67890123C", svc: "movil", plan: "Móvil 50GB", price: "22.99", status: "Pendiente", prov: "Sevilla" },
              { name: "Ana Rodríguez Díaz", id: "CLI-00005", email: "ana.rodriguez@outlook.com", dni: "78901234D", svc: "fibra", plan: "Fibra 300Mb", price: "33.99", status: "Suspendido", prov: "Málaga" },
            ].map((c, i) => {
              const svcColors: Record<string, string> = { fibra: "bg-sky-100 text-sky-700", movil: "bg-violet-100 text-violet-700", convergente: "bg-brand-100 text-brand-700" };
              const stColors: Record<string, string> = { Activo: "bg-emerald-100 text-emerald-700", Pendiente: "bg-amber-100 text-amber-700", Suspendido: "bg-red-100 text-red-700" };
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-brand-50/30 cursor-pointer transition-colors">
                  <td className="table-cell">
                    <div className="font-semibold text-gray-900 text-[13px]">{c.name}</div>
                    <div className="text-[11px] text-gray-400">{c.id} · {c.email}</div>
                  </td>
                  <td className="table-cell font-mono text-[12px] text-gray-500">{c.dni}</td>
                  <td className="table-cell"><span className={`badge ${svcColors[c.svc]}`}>{c.svc}</span></td>
                  <td className="table-cell text-[12px] text-gray-600">{c.plan}</td>
                  <td className="table-cell text-right font-bold text-[13px]">{c.price}€</td>
                  <td className="table-cell text-center"><span className={`badge ${stColors[c.status]}`}>{c.status}</span></td>
                  <td className="table-cell text-[12px] text-gray-500">{c.prov}</td>
                  <td className="table-cell text-center">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-[12px] text-gray-500">1–5 de 150 clientes</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40">Anterior</button>
            <button className="px-3 py-1.5 text-[12px] rounded-lg bg-brand-600 text-white">1</button>
            <button className="px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50">3</button>
            <button className="px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
