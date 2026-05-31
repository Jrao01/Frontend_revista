// ApprovedArticlesList.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../../api/api'; // centralized API

interface Article {
  id: string;
  titulo_es: string;
  autor_principal_id: number;
  fecha_recepcion: string;
  linea_id: number;
  revista_id: number;
  // add other fields as required
}

const ApprovedArticlesList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // Placeholder fetch – replace with real API call
    const load = async () => {
      try {
        const data = await api.articulos.fetchApproved();
        setArticles(data);
      } catch (e) {
        console.error('Failed to load approved articles', e);
      }
    };
    load();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((a) => (
        <div key={a.id} className="bg-white border rounded p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">{a.titulo_es}</h3>
          <p className="text-sm text-gray-600">Autor ID: {a.autor_principal_id}</p>
          <p className="text-sm text-gray-600">Fecha: {a.fecha_recepcion}</p>
          {/* Add more fields, buttons, etc. */}
        </div>
      ))}
    </div>
  );
};

export default ApprovedArticlesList;
