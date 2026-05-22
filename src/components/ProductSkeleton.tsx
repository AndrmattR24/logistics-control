export function ProductSkeleton() {
  return (
    <>
      {/* 1. DISEÑO DE CARGA PARA MÓVILES (Tarjetas parpadeantes) */}
      <div className="block md:hidden space-y-4 w-full">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-4 bg-white rounded-lg shadow border border-gray-100 animate-pulse"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-2 w-2/3">
                {/* Categoría */}
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                {/* Descripción */}
                <div className="h-5 bg-gray-200 rounded w-full"></div>
              </div>
              {/* Estado Badge */}
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>

            {/* Detalles técnicos */}
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 border-t pt-3">
              <div className="h-9 bg-gray-200 rounded flex-1"></div>
              <div className="h-9 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. DISEÑO DE CARGA PARA ESCRITORIO (Filas de tabla fantasmas) */}
      <div className="hidden md:block w-full overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 animate-pulse">
            {[1, 2, 4, 5].map((n) => (
              <tr key={n}>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
