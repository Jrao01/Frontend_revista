// AreaLineManagement.tsx
import React, { useState } from 'react';

// Placeholder data structures – replace with real API calls
interface Area {
  id: number;
  nombre: string;
  color_institucional?: string;
}
interface Linea {
  id: number;
  nombre: string;
  tipo?: string;
  area_id: number;
}

const AreaLineManagement: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [lineas, setLineas] = useState<Linea[]>([]);

  // Placeholder handlers – to be connected to backend
  const handleCreateArea = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call API to create area and refresh list
    console.log('Create area (placeholder)');
  };

  const handleCreateLinea = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call API to create linea and refresh list
    console.log('Create linea (placeholder)');
  };

  return (
    <div className="space-y-6">
      {/* Areas List and Creation */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Áreas</h2>
        <ul className="mb-4">
          {areas.map((a) => (
            <li key={a.id} className="py-1" onClick={() => setSelectedArea(a)}>
              {a.nombre}
            </li>
          ))}
        </ul>
        <form onSubmit={handleCreateArea} className="flex space-x-2">
          <input type="text" placeholder="Nombre del área" className="border rounded p-1" />
          <input type="text" placeholder="Color institucional" className="border rounded p-1" />
          <button type="submit" className="bg-blue-500 text-white rounded px-3">
            Crear Área
          </button>
        </form>
      </section>

      {/* Lineas List and Creation (depends on selected area) */}
      {selectedArea && (
        <section>
          <h3 className="text-lg font-medium mb-2">Líneas de {selectedArea.nombre}</h3>
          <ul className="mb-4">
            {lineas
              .filter((l) => l.area_id === selectedArea.id)
              .map((l) => (
                <li key={l.id} className="py-1">
                  {l.nombre} ({l.tipo})
                </li>
              ))}
          </ul>
          <form onSubmit={handleCreateLinea} className="flex space-x-2">
            <input type="text" placeholder="Nombre de la línea" className="border rounded p-1" />
            <input type="text" placeholder="Tipo" className="border rounded p-1" />
            <button type="submit" className="bg-green-500 text-white rounded px-3">
              Crear Línea
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default AreaLineManagement;
