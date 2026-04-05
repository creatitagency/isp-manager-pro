export default function FacturacionPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Facturación</h1><p className="page-subtitle">Gestión de facturas, cobros y remesas SEPA</p></div>
        <div className="flex gap-2">
          <button className="btn-secondary text-[13px]">Generar remesa SEPA</button>
          <button className="btn-primary text-[13px]">Facturar periodo</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{l:"Total facturado",v:"18.4k€",c:"from-blue-500 to-blue-600"},{l:"Cobrado",v:"14.2k€",c:"from-emerald-500 to-emerald-600"},{l:"Pendiente",v:"3.1k€",c:"from-orange-500 to-orange-600"},{l:"Impagado",v:"1.1k€",c:"from-red-500 to-red-600"}].map((s,i)=>(
          <div key={i} className="stat-card"><div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.c} flex items-center justify-center mb-3 shadow-sm`}><span className="text-white text-xs font-bold">{["📋","✅","⏳","❌"][i]}</span></div><div className="text-xl font-bold text-gray-900">{s.v}</div><div className="text-[12px] text-gray-500 mt-0.5">{s.l}</div></div>
        ))}
      </div>
      <div className="card p-8 text-center text-gray-400"><p>Conecta la base de datos para gestionar facturas reales.</p><p className="mt-2"><code className="text-[12px] bg-gray-100 px-2 py-1 rounded">POST /api/billing/generate {"{"} period: "2026-03" {"}"}</code></p></div>
    </div>
  );
}
