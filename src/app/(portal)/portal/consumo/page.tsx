/**
 * Customer Portal — Consumption / Usage page
 */
export default function PortalConsumo() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Mi consumo</h1>
        <p className="page-subtitle">Datos, llamadas y SMS del periodo actual</p>
      </div>

      {/* Data Usage */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title">Datos móviles</div>
          <span className="text-[12px] text-gray-400">Marzo 2026</span>
        </div>
        <div className="flex items-end gap-4 mb-4">
          <div className="text-4xl font-bold text-gray-900">12.4</div>
          <div className="text-lg text-gray-400 mb-1">/ 25 GB</div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full" style={{ width: "49.6%" }} />
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-gray-500">49.6% consumido</span>
          <span className="text-emerald-600 font-semibold">12.6 GB disponibles</span>
        </div>
      </div>

      {/* Voice & SMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="section-title mb-3">Llamadas</div>
          <div className="text-3xl font-bold text-gray-900">142 min</div>
          <div className="text-[13px] text-gray-500 mt-1">de minutos ilimitados</div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Llamadas nacionales</span>
              <span className="font-semibold">128 min</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Llamadas a móvil</span>
              <span className="font-semibold">14 min</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Números especiales</span>
              <span className="font-semibold text-red-600">2.30€</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="section-title mb-3">SMS</div>
          <div className="text-3xl font-bold text-gray-900">5</div>
          <div className="text-[13px] text-gray-500 mt-1">mensajes enviados</div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">SMS nacionales</span>
              <span className="font-semibold">5</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Coste total</span>
              <span className="font-semibold">0.45€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage History */}
      <div className="card p-6">
        <div className="section-title mb-4">Últimas llamadas</div>
        <div className="space-y-2">
          {[
            { dest: "612 456 789", type: "Llamada saliente", dur: "3:42", cost: "Incl.", date: "31/03 14:23" },
            { dest: "900 123 456", type: "Llamada saliente", dur: "1:15", cost: "Gratis", date: "31/03 11:08" },
            { dest: "654 987 321", type: "Llamada entrante", dur: "8:31", cost: "—", date: "30/03 18:45" },
            { dest: "902 345 678", type: "Llamada saliente", dur: "2:10", cost: "0.74€", date: "30/03 10:22" },
            { dest: "internet", type: "Sesión datos", dur: "—", cost: "148MB", date: "30/03 09:15" },
          ].map((call, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex-1">
                <div className="text-[13px] font-medium text-gray-900">{call.dest}</div>
                <div className="text-[11px] text-gray-400">{call.type} · {call.date}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-mono">{call.dur}</div>
                <div className="text-[11px] text-gray-400">{call.cost}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
