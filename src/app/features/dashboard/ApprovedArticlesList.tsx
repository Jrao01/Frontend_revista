import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../api/api';
import { Search, Filter, Download, Eye, ArrowRight, X, ChevronDown, FileText } from 'lucide-react';

interface ArticleFile {
  id: number;
  articulo_id: number;
  tipo_archivo: string;
  url: string;
  filename: string;
  version: number;
  es_anonimo: boolean;
}

interface ArticleAuthor {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

interface ArticleNumero {
  id: number;
  numero: string;
  anio: number;
  titulo_edicion: string;
  status: string;
  volumen?: { id: number; numero_volumen: string };
}

interface Article {
  id: number;
  titulo_es: string;
  titulo_en: string;
  autor_principal_id: number;
  fecha_recepcion: string;
  linea_id: number;
  revista_id: number;
  numero_revista_id: number | null;
  status: string;
  resumen_es?: string;
  resumen_en?: string;
  autor_principal?: ArticleAuthor;
  archivos?: ArticleFile[];
  numero_revista?: ArticleNumero;
  lineas_investigacion?: { id: number; nombre: string };
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  enviado: { label: 'Enviado', color: '#6c8ebf', bg: 'rgba(108,142,191,0.1)' },
  En_evaluacion: { label: 'En Evaluación', color: '#9b7fd4', bg: 'rgba(155,127,212,0.1)' },
  por_evaluar: { label: 'Por Evaluar', color: '#e07b54', bg: 'rgba(224,123,84,0.1)' },
  aprobado: { label: 'Aprobado', color: '#3ecf8e', bg: 'rgba(62,207,142,0.1)' },
  rechazado: { label: 'Rechazado', color: '#e05252', bg: 'rgba(224,82,82,0.1)' },
  asignado: { label: 'Asignado', color: '#0b90c8', bg: 'rgba(11,144,200,0.1)' },
  publicado: { label: 'Publicado', color: '#0b0b0b', bg: 'rgba(11,11,11,0.08)' },
  por_corregir: { label: 'Por Corregir', color: '#e8c55e', bg: 'rgba(232,197,94,0.1)' },
  Corregido: { label: 'Corregido', color: '#3ecf8e', bg: 'rgba(62,207,142,0.1)' },
  en_revision: { label: 'En Revisión', color: '#9b7fd4', bg: 'rgba(155,127,212,0.1)' },
};

function getStatusStyle(status: string) {
  return STATUS_MAP[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
}

const ApprovedArticlesList: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningArticle, setAssigningArticle] = useState<Article | null>(null);
  const [revistas, setRevistas] = useState<any[]>([]);
  const [volumenes, setVolumenes] = useState<any[]>([]);
  const [numeros, setNumeros] = useState<any[]>([]);
  const [selectedRevista, setSelectedRevista] = useState<number | ''>('');
  const [selectedVolumen, setSelectedVolumen] = useState<number | ''>('');
  const [selectedNumero, setSelectedNumero] = useState<number | ''>('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignDoi, setAssignDoi] = useState('');

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailArticle, setDetailArticle] = useState<Article | null>(null);

  useEffect(() => {
    loadArticles();
    loadRevistas();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.articulos.fetchApproved();
      setArticles(data);
    } catch (e) {
      console.error('Failed to load articles', e);
    } finally {
      setLoading(false);
    }
  };

  const loadRevistas = async () => {
    try {
      const data = await api.revistas.fetchAll();
      setRevistas(data);
    } catch (e) {
      console.error('Failed to load revistas', e);
    }
  };

  const handleRevistaChange = async (revId: number) => {
    setSelectedRevista(revId);
    setSelectedVolumen('');
    setSelectedNumero('');
    setVolumenes([]);
    setNumeros([]);
    if (!revId) return;
    try {
      const data = await api.revistas.fetchVolumenes(revId);
      setVolumenes(data);
      // Auto-seleccionar el último volumen
      if (data.length > 0) {
        const ultimoVol = data.reduce((max: any, v: any) =>
          Number(v.numero_volumen) > Number(max.numero_volumen) ? v : max
        );
        setSelectedVolumen(ultimoVol.id);
        // Cargar los números del último volumen
        const nums = await api.revistas.fetchNumeros(revId, ultimoVol.id);
        setNumeros(nums);
      }
    } catch (e) {
      console.error('Failed to load volumenes', e);
    }
  };

  const handleAssign = async () => {
    if (!assigningArticle || !selectedNumero) return;
    setAssignLoading(true);
    setAssignError('');
    try {
      await api.articulos.assign(assigningArticle.id, selectedNumero, assignDoi.trim() || undefined);
      setShowAssignModal(false);
      setAssigningArticle(null);
      setSelectedRevista('');
      setSelectedVolumen('');
      setSelectedNumero('');
      setAssignDoi('');
      loadArticles();
    } catch (e: any) {
      setAssignError(e.message || 'Error al asignar artículo');
    } finally {
      setAssignLoading(false);
    }
  };

  const openAssignModal = (article: Article) => {
    setAssigningArticle(article);
    setSelectedRevista(article.revista_id || '');
    setSelectedVolumen('');
    setSelectedNumero('');
    setAssignDoi('');
    setVolumenes([]);
    setNumeros([]);
    setAssignError('');
    setShowAssignModal(true);
    if (article.revista_id) {
      handleRevistaChange(article.revista_id);
    }
  };

  const getManuscriptUrl = (article: Article): string | null => {
    const file = article.archivos?.find(f => f.tipo_archivo === 'manuscrito_original');
    if (!file) return null;
    if (file.url.startsWith('http')) return file.url;
    return `http://localhost:3000${file.url}`;
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const principal = a.autor_principal;
      const coautores = a.autores_secundarios
        ? a.autores_secundarios.map((as: any) => {
            const u = as.usuario || as.Usuario;
            return u ? `${u.nombre} ${u.apellido}` : "";
          }).filter(Boolean)
        : [];
      const allAuthors = [
        principal ? `${principal.nombre} ${principal.apellido}` : "",
        ...coautores
      ].filter(Boolean).join(", ");
      const matchesSearch =
        !searchTerm ||
        a.titulo_es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.titulo_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allAuthors.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'todos' || a.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [articles, searchTerm, filterStatus]);

  const statusOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [articles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-gray-500">Cargando artículos...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter size={14} />
            {filterStatus === 'todos' ? 'Todos los estados' : getStatusStyle(filterStatus).label}
            <ChevronDown size={14} />
          </button>
          {showFilterMenu && (
            <div className="absolute z-20 top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px]">
              <button
                onClick={() => { setFilterStatus('todos'); setShowFilterMenu(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${filterStatus === 'todos' ? 'font-semibold text-emerald-600' : ''}`}
              >
                Todos ({articles.length})
              </button>
              {statusOptions.map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${filterStatus === status ? 'font-semibold' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusStyle(status).color }}></span>
                    {getStatusStyle(status).label}
                  </span>
                  <span className="text-gray-400 text-xs">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        {filteredArticles.length} de {articles.length} artículos
      </div>

      {/* Article Cards */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p>No se encontraron artículos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => {
            const statusStyle = getStatusStyle(article.status);
            const manuscriptUrl = getManuscriptUrl(article);
            return (
              <div
                key={article.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}
                  >
                    {statusStyle.label}
                  </span>
                  <span className="text-xs text-gray-400">#{article.id}</span>
                </div>

                {/* Title */}
                <h3
                  className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => navigate(`/articulo/${article.id}`)}
                >
                  {article.titulo_es || article.titulo_en || 'Sin título'}
                </h3>

                {/* Author */}
                <p className="text-sm text-gray-600 mb-1">
                  {(() => {
                    const principal = article.autor_principal;
                    const coautores = article.autores_secundarios
                      ? article.autores_secundarios.map((as: any) => {
                          const u = as.usuario || as.Usuario;
                          return u ? `${u.nombre} ${u.apellido}` : "";
                        }).filter(Boolean)
                      : [];
                    const allAuthors = [
                      principal ? `${principal.nombre} ${principal.apellido}` : `Autor #${article.autor_principal_id}`,
                      ...coautores
                    ].filter(Boolean);
                    return allAuthors.join(", ");
                  })()}
                </p>

                {/* Date */}
                <p className="text-xs text-gray-400 mb-3">
                  {article.fecha_recepcion
                    ? new Date(article.fecha_recepcion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Sin fecha'}
                </p>

                {/* Assignment info */}
                {article.numero_revista && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                    Vol. {article.numero_revista.volumen?.numero_volumen || '—'}
                    {article.numero_revista.numero ? `, Nº ${article.numero_revista.numero}` : ''}
                    {article.numero_revista.anio ? ` (${article.numero_revista.anio})` : ''}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => { setDetailArticle(article); setShowDetailModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye size={13} /> Detalles
                  </button>
                  {manuscriptUrl && (
                    <a
                      href={manuscriptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Descargar manuscrito PDF"
                    >
                      <Download size={13} /> PDF
                    </a>
                  )}
                  {article.status === 'aprobado' && (
                    <button
                      onClick={() => openAssignModal(article)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors ml-auto"
                      title="Asignar a volumen/número"
                    >
                      <ArrowRight size={13} /> Asignar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && assigningArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Asignar a Revista</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{assigningArticle.titulo_es}</p>
              </div>
              <button
                onClick={() => { setShowAssignModal(false); setAssigningArticle(null); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {assignError && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">{assignError}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revista</label>
                <input
                  type="text"
                  value={revistas.find((r: any) => r.id === selectedRevista)?.nombre || '—'}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Línea de Investigación</label>
                <input
                  type="text"
                  value={assigningArticle?.lineas_investigacion?.nombre || '—'}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volumen</label>
                <input
                  type="text"
                  value={volumenes.find((v: any) => v.id === selectedVolumen) ? `Volumen ${volumenes.find((v: any) => v.id === selectedVolumen).numero_volumen}` : '—'}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <select
                  value={selectedNumero}
                  onChange={(e) => setSelectedNumero(Number(e.target.value))}
                  disabled={!selectedVolumen}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">
                    {!selectedVolumen ? 'Primero seleccione un volumen...' : 'Seleccionar número...'}
                  </option>
                  {numeros.filter((n: any) => n.status === 'futuro').map((n: any) => (
                    <option key={n.id} value={n.id}>
                      Nº {n.numero}{n.titulo_edicion ? ` - ${n.titulo_edicion}` : ''}{n.anio ? ` (${n.anio})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DOI (Opcional)</label>
                <input
                  type="text"
                  value={assignDoi}
                  onChange={(e) => setAssignDoi(e.target.value)}
                  placeholder="10.xxxx/xxxxx"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">Identificador Digital de Objeto del artículo.</p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { setShowAssignModal(false); setAssigningArticle(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedNumero || assignLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignLoading ? 'Asignando...' : 'Confirmar Asignación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Detalles del Artículo</h3>
                <p className="text-xs text-gray-500 mt-0.5">ID #{detailArticle.id}</p>
              </div>
              <button
                onClick={() => { setShowDetailModal(false); setDetailArticle(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ color: getStatusStyle(detailArticle.status).color, backgroundColor: getStatusStyle(detailArticle.status).bg }}
                >
                  {getStatusStyle(detailArticle.status).label}
                </span>
              </div>

              <h4 className="text-base font-semibold text-gray-900 mb-1">
                {detailArticle.titulo_es}
              </h4>
              {detailArticle.titulo_en && (
                <p className="text-sm text-gray-500 italic mb-4">{detailArticle.titulo_en}</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-400 font-medium min-w-[90px]">Autor(es):</span>
                  <span className="text-gray-700">
                    {(() => {
                      const principal = detailArticle.autor_principal;
                      const coautores = detailArticle.autores_secundarios
                        ? detailArticle.autores_secundarios.map((as: any) => {
                            const u = as.usuario || as.Usuario;
                            return u ? `${u.nombre} ${u.apellido}` : "";
                          }).filter(Boolean)
                        : [];
                      const allAuthors = [
                        principal ? `${principal.nombre} ${principal.apellido}` : `Autor #${detailArticle.autor_principal_id}`,
                        ...coautores
                      ].filter(Boolean);
                      return allAuthors.join(", ");
                    })()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 font-medium min-w-[90px]">Línea:</span>
                  <span className="text-gray-700">{detailArticle.lineas_investigacion?.nombre || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 font-medium min-w-[90px]">Fecha:</span>
                  <span className="text-gray-700">{detailArticle.fecha_recepcion || '—'}</span>
                </div>
                {detailArticle.numero_revista && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 font-medium min-w-[90px]">Asignado:</span>
                    <span className="text-gray-700">
                      Vol. {detailArticle.numero_revista.volumen?.numero_volumen || '—'}
                      {detailArticle.numero_revista.numero ? `, Nº ${detailArticle.numero_revista.numero}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {detailArticle.resumen_es && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Resumen</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">{detailArticle.resumen_es}</p>
                </div>
              )}

              {detailArticle.resumen_en && (
                <div className="mt-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Abstract</h5>
                  <p className="text-sm text-gray-600 leading-relaxed italic">{detailArticle.resumen_en}</p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { setShowDetailModal(false); setDetailArticle(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
              {detailArticle.status === 'publicado' && (
                <button
                  onClick={() => { window.open(`/articulo/${detailArticle.id}`, '_blank'); }}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                >
                  Ver en web
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedArticlesList;
