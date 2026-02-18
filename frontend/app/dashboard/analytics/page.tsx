"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Análiticas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <h3 className="text-sm font-semibold mb-2 opacity-70">
            Total de Veiculos
          </h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold mb-2 opacity-70">
            Anuncios Ativos
          </h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold mb-2 opacity-70">
            Visualizacoes
          </h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold mb-2 opacity-70">Contatos</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Ultimos Anuncios</h2>
        <p className="opacity-50">Nenhum dado disponivel</p>
      </div>
    </div>
  );
}
