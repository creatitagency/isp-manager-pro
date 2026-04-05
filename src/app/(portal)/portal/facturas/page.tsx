/**
 * Customer Portal — Invoices page
 * Lists all invoices with download and payment options
 */
export default function PortalFacturas() {
  const invoices = [
    { id: "FAC-202603-000045", period: "Marzo 2026", date: "01/03/2026", due: "20/03/2026", total: 59.28, status: "Pendiente" },
    { id: "FAC-202602-000045", period: "Febrero 2026", date: "01/02/2026", due: "20/02/2026", total: 59.28, status: "Pagada" },
    { id: "FAC-202601-000045", period: "Enero 2026", date: "01/01/2026", due: "20/01/2026", total: 59.28, status: "Pagada" },
    { id: "FAC-202512-000045", period: "Diciembre 2025", date: "01/12/2025", due: "20/12/2025", total: 59.28, status: "Pagada" },
  ];

  const statusStyle: Record<string, string> = {
    Pagada: "bg-emerald-100 text-emerald-700",
    Pendiente: "bg-amber-100 text-amber-700",
    Impagada: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Mis facturas</h1>
        <p className="page-subtitle">Consulta y descarga tus facturas</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">Nº Factura</th>
              <th className="table-header">Periodo</th>
              <th className="table-header">Emisión</th>
              <th className="table-header">Vencimiento</th>
              <th className="table-header text-right">Total</th>
              <th className="table-header text-center">Estado</th>
              <th className="table-header text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="table-cell font-mono text-brand-600 font-semibold text-[13px]">{inv.id}</td>
                <td className="table-cell text-gray-700">{inv.period}</td>
                <td className="table-cell text-gray-500">{inv.date}</td>
                <td className="table-cell text-gray-500">{inv.due}</td>
                <td className="table-cell text-right font-bold text-gray-900">{inv.total.toFixed(2)}€</td>
                <td className="table-cell text-center">
                  <span className={`badge ${statusStyle[inv.status]}`}>{inv.status}</span>
                </td>
                <td className="table-cell text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-[12px] text-brand-600 font-semibold hover:underline">
                      PDF
                    </button>
                    {inv.status === "Pendiente" && (
                      <button className="text-[12px] bg-brand-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-brand-700 transition-colors">
                        Pagar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <p className="text-[13px] text-gray-500">
          Las facturas se generan automáticamente el día 1 de cada mes. El cobro se realiza
          por domiciliación SEPA en la fecha de vencimiento. Si necesitas una copia o tienes
          alguna consulta, puedes abrir un ticket desde tu área de cliente.
        </p>
      </div>
    </div>
  );
}
