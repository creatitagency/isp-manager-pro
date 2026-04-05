/**
 * Customer Portal — Home / Dashboard
 * Shows service summary, consumption, latest invoice, and quick actions
 */
export default function PortalHome() {
  // In production, this data comes from the authenticated client session
  const client = {
    name: "José Arroyo",
    plan: "Pack Fibra 600 + Móvil 25GB",
    status: "Activo",
    services: [
      { type: "Fibra", plan: "Fibra 600Mb", speed: "600/600 Mbps", status: "online" },
      { type: "Móvil", number: "612 345 678", data: "25GB", used: "12.4GB", status: "online" },
    ],
    lastInvoice: { number: "FAC-202603-000045", period: "Marzo 2026", total: 59.28, status: "Pendiente" },
    loyaltyPoints: 850,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Hola, {client.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Tu resumen de servicios con MooviTelecom</p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {client.services.map((svc, i) => (
          <div key={i} className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{svc.type}</div>
                <div className="text-lg font-bold text-gray-900 mt-0.5">{svc.plan}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-semibold text-emerald-600">{svc.status}</span>
              </div>
            </div>

            {svc.type === "Fibra" && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-[13px] text-gray-500">Velocidad contratada</div>
                <div className="text-xl font-bold text-gray-900 mt-0.5">{svc.speed}</div>
              </div>
            )}

            {svc.type === "Móvil" && (
              <>
                <div className="text-[13px] text-gray-500">Número: <span className="font-semibold text-gray-900">{svc.number}</span></div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-gray-500">Datos consumidos</span>
                    <span className="text-[13px] font-bold text-brand-600">{svc.used} / {svc.data}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
                      style={{ width: `${(parseFloat(svc.used || "0") / parseFloat(svc.data || "1")) * 100}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Latest Invoice + Loyalty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card p-6">
          <div className="section-title mb-4">Última factura</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-sm text-brand-600 font-semibold">{client.lastInvoice.number}</div>
              <div className="text-sm text-gray-500 mt-0.5">{client.lastInvoice.period}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{client.lastInvoice.total.toFixed(2)}€</div>
              <div className="badge bg-amber-100 text-amber-700 mt-1">{client.lastInvoice.status}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button className="btn-primary text-[13px]">Descargar PDF</button>
            <button className="btn-secondary text-[13px]">Ver todas las facturas</button>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-brand-50 to-white">
          <div className="section-title mb-3">Puntos de fidelidad</div>
          <div className="text-3xl font-bold text-brand-600">{client.loyaltyPoints}</div>
          <div className="text-[12px] text-gray-500 mt-1">puntos acumulados</div>
          <div className="mt-4 text-[12px] text-brand-600 font-semibold cursor-pointer hover:underline">
            Ver catálogo de premios →
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <div className="section-title mb-4">Acciones rápidas</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Cambiar de plan", emoji: "📱" },
            { label: "Ver mis consumos", emoji: "📊" },
            { label: "Abrir incidencia", emoji: "🔧" },
            { label: "Invitar amigos", emoji: "🎁" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">{action.emoji}</span>
              <span className="text-[12px] font-semibold text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
