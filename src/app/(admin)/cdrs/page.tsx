export default function CdrsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">CDRs</h1>
        <p className="page-subtitle">Registros de llamadas, importación y tarificación</p>
      </div>
      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Módulo CDRs</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Este módulo está listo para conectar con la base de datos.
          Ejecuta <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px]">npm run db:push</code> para crear las tablas
          y <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px]">npm run db:seed</code> para cargar datos de prueba.
        </p>
      </div>
    </div>
  );
}
