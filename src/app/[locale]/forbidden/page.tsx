import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Error Card */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#000] text-center">
          {/* Error Code */}
          <div className="mb-6">
            <span className="text-8xl font-bold text-[#E67E22]">403</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">ACCESO PROHIBIDO</h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            No tienes permiso para acceder a este recurso. Esto puede deberse a:
          </p>

          {/* Reasons List */}
          <div className="bg-[#FDCB6E] border-4 border-black p-4 mb-8 text-left">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span>🔒</span>
                <span>No has iniciado sesión</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🚫</span>
                <span>Intentas acceder al proyecto de otra persona</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⏰</span>
                <span>Tu sesión ha expirado</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⚠️</span>
                <span>Intentas acceder a una página que no coincide con el estado de tu cuenta</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-[#FDCB6E] border-4 border-black font-bold shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-shadow"
            >
              INICIAR SESIÓN
            </Link>
            <Link
              href="/projects"
              className="px-6 py-3 bg-white border-4 border-black font-bold hover:bg-gray-100 transition-colors"
            >
              VER PROYECTOS
            </Link>
          </div>
        </div>

        {/* Bee decoration */}
        <div className="text-center mt-8">
          <span className="text-4xl">🐝</span>
          <p className="text-gray-500 text-sm mt-2">
            ¿Perdido? Vuelve a la colmena.
          </p>
        </div>
      </div>
    </div>
  );
}
