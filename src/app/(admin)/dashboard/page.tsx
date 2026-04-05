/**
 * Dashboard — Panel de Mando
 * Server component that fetches real data from Prisma
 */
// In production this uses real data from prisma
// For now we use static data to allow deployment without DB

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Panel de Mando</h1>
        <p className="page-subtitle">Vista global de MooviTelecom — Marzo 2026</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Clientes activos", value: "127", trend: "+4.8%", up: true, color: "from-blue-500 to-blue-600" },
          { label: "MRR (sin IVA)", value: "5.2k€", trend: "+6.2%", up: true, color: "from-emerald-500 to-emerald-600" },
          { label: "Pendiente cobro", value: "1.8k€", trend: "12 fact.", up: false, color: "from-orange-500 to-orange-600" },
          { label: "Tickets abiertos", value: "7", trend: "2 urgentes", up: false, color: "from-red-500 to-red-600" },
        ].map((kpi, i) => (
          <div key={i} className="stat-card">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3 shadow-sm`}>
              <span className="text-white text-sm font-bold">
                {["👥", "💰", "⏳", "🔧"][i]}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{kpi.label}</div>
            <div className={`text-[11px] font-semibold mt-2 ${kpi.up ? "text-emerald-600" : "text-orange-600"}`}>
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-6">
          <div className="section-title mb-4">Evolución de ingresos</div>
          <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">
            <p>Conecta la base de datos para ver las gráficas en tiempo real.<br/>
            <code className="text-[12px] bg-gray-100 px-2 py-1 rounded mt-2 inline-block">npm run db:push && npm run db:seed</code></p>
          </div>
        </div>
        <div className="card p-6">
          <div className="section-title mb-4">Distribución servicios</div>
          <div className="space-y-4 mt-8">
            {[
              { label: "Fibra", pct: 28, color: "bg-sky-500" },
              { label: "Móvil", pct: 35, color: "bg-violet-500" },
              { label: "Convergente", pct: 37, color: "bg-brand-500" },
            ].map((svc) => (
              <div key={svc.label}>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-gray-600 font-medium">{svc.label}</span>
                  <span className="font-bold text-gray-900">{svc.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${svc.color} rounded-full`} style={{ width: `${svc.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="section-title mb-4">Actividad reciente</div>
          <div className="space-y-3">
            {[
              { icon: "🔴", msg: "OLT-MAD-02: degradación de señal detectada", time: "Hace 35min", type: "error" },
              { icon: "⚠️", msg: "12 facturas impagadas pendientes de gestión", time: "Hace 1h", type: "warning" },
              { icon: "✅", msg: "Lote CDRs Marzo importado (3.000 registros)", time: "Hace 3h", type: "success" },
              { icon: "🔄", msg: "5 portabilidades activas en curso", time: "Hace 4h", type: "info" },
              { icon: "📧", msg: "Remesa SEPA de Febrero procesada", time: "Hace 1d", type: "success" },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-sm mt-0.5">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700">{alert.msg}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="section-title mb-4">Resumen rápido</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "CDRs procesados", value: "3,000", sub: "Marzo 2026" },
              { label: "Portabilidades", value: "5", sub: "en curso" },
              { label: "ARPU", value: "41.20€", sub: "por cliente" },
              { label: "Churn rate", value: "2.1%", sub: "mensual" },
              { label: "Contratos vigentes", value: "118", sub: "12 con permanencia" },
              { label: "Stock bajo", value: "3", sub: "equipos" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3.5">
                <div className="text-xl font-bold text-gray-900">{item.value}</div>
                <div className="text-[12px] text-gray-500 mt-0.5">{item.label}</div>
                <div className="text-[11px] text-gray-400">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
