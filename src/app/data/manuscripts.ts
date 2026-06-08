export type ManuscriptStatus =
  | "submitted"
  | "editor_review"
  | "peer_review"
  | "major_revision"
  | "minor_revision"
  | "accepted"
  | "rejected"
  | "published";

export interface ManuscriptComment {
  id: string;
  author: string;
  role: "editor" | "jurado" | "investigador";
  content: string;
  date: string;
  isPrivate?: boolean;
}

export interface ManuscriptTimelineEntry {
  status: ManuscriptStatus;
  date: string;
  actor: string;
  actorRole: string;
  note?: string;
}

export interface Manuscript {
  id: string;
  title: string;
  category: string;
  type: string;
  abstract: string;
  keywords: string[];
  submittedByEmail: string;
  submittedByName: string;
  institution: string;
  coauthors: string[];
  submittedDate: string;
  status: ManuscriptStatus;
  assignedEditorEmail?: string;
  assignedEditorName?: string;
  assignedJurados: { email: string; name: string; submitted: boolean }[];
  comments: ManuscriptComment[];
  timeline: ManuscriptTimelineEntry[];
  doi?: string;
  articleSlug?: string;
  wordCount?: number;
  pages?: number;
}

export const STATUS_CONFIG: Record<ManuscriptStatus, { label: string; color: string; bg: string; step: number }> = {
  submitted: { label: "Enviado", color: "#6c8ebf", bg: "rgba(108,142,191,0.1)", step: 1 },
  editor_review: { label: "Revisión Editorial", color: "#e07b54", bg: "rgba(224,123,84,0.1)", step: 2 },
  peer_review: { label: "Revisión por Pares", color: "#9b7fd4", bg: "rgba(155,127,212,0.1)", step: 3 },
  major_revision: { label: "Revisión Mayor", color: "#e8c55e", bg: "rgba(232,197,94,0.1)", step: 4 },
  minor_revision: { label: "Revisión Menor", color: "#f0a14e", bg: "rgba(240,161,78,0.1)", step: 4 },
  accepted: { label: "Aceptado", color: "#3ecf8e", bg: "rgba(62,207,142,0.1)", step: 5 },
  rejected: { label: "Rechazado", color: "#e05252", bg: "rgba(224,82,82,0.1)", step: 5 },
  published: { label: "Publicado", color: "#0b0b0b", bg: "rgba(11,11,11,0.08)", step: 6 },
};

export const WORKFLOW_STEPS = [
  { key: "submitted", label: "Enviado", description: "Manuscrito recibido" },
  { key: "editor_review", label: "Rev. Editorial", description: "Editor asignado" },
  { key: "peer_review", label: "Rev. por Pares", description: "Jurados evaluando" },
  { key: "major_revision", label: "Revisión", description: "Respuesta del autor" },
  { key: "accepted", label: "Aceptado", description: "Decisión final" },
  { key: "published", label: "Publicado", description: "Disponible online" },
];

export const NEXT_STATUS: Partial<Record<ManuscriptStatus, ManuscriptStatus[]>> = {
  submitted: ["editor_review", "rejected"],
  editor_review: ["peer_review", "rejected"],
  peer_review: ["major_revision", "minor_revision", "accepted", "rejected"],
  major_revision: ["peer_review", "accepted", "rejected"],
  minor_revision: ["accepted", "rejected"],
  accepted: ["published"],
};

const mockManuscripts: Manuscript[] = [
  {
    id: "ms-001",
    title: "Neuroplasticidad Adaptativa en Corteza Prefrontal bajo Privación de Sueño Crónica",
    category: "Neurociencia",
    type: "Investigación Original",
    abstract: "Examinamos los mecanismos de neuroplasticidad compensatoria en la corteza prefrontal dorsolateral de sujetos con privación crónica de sueño mediante resonancia magnética funcional de alta resolución y análisis de conectividad dinámica.",
    keywords: ["Neuroplasticidad", "Privación de Sueño", "Corteza Prefrontal", "fMRI"],
    submittedByEmail: "investigador@demo.com",
    submittedByName: "Dr. Alejandro García",
    institution: "Instituto de Neurociencias, UNAM",
    coauthors: ["Dra. Patricia Reyes (IPN)", "Dr. Simón Varela (UAM)"],
    submittedDate: "2025-01-15",
    status: "published",
    assignedEditorEmail: "editor@demo.com",
    assignedEditorName: "Dra. Carmen Vidal",
    assignedJurados: [
      { email: "jurado@demo.com", name: "Dr. Marco Rinaldi", submitted: true },
      { email: "jurado2@demo.com", name: "Dra. Ana Torres", submitted: true },
    ],
    doi: "10.1038/cienceduc.2025.0089",
    articleSlug: "anomalias-espectro-cuasares",
    wordCount: 6842,
    pages: 18,
    comments: [
      {
        id: "c1",
        author: "Dra. Carmen Vidal",
        role: "editor",
        content: "Manuscrito aceptado con revisiones menores. Excelente metodología y contribución significativa al campo.",
        date: "2025-02-20",
      },
      {
        id: "c2",
        author: "Dr. Marco Rinaldi",
        role: "jurado",
        content: "Recomiendo aceptación. La metodología fMRI es sólida y los resultados son reproducibles. Sugerí expandir la discusión sobre mecanismos moleculares.",
        date: "2025-02-10",
        isPrivate: true,
      },
    ],
    timeline: [
      { status: "submitted", date: "2025-01-15", actor: "Dr. Alejandro García", actorRole: "Investigador", note: "Envío inicial del manuscrito" },
      { status: "editor_review", date: "2025-01-18", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Asignado para revisión editorial" },
      { status: "peer_review", date: "2025-01-25", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Enviado a 2 revisores externos" },
      { status: "minor_revision", date: "2025-02-12", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Revisión menor solicitada: expandir discusión y actualizar referencias" },
      { status: "accepted", date: "2025-02-20", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Aceptado tras revisiones menores satisfactorias" },
      { status: "published", date: "2025-03-01", actor: "Sistema SaberUnerg", actorRole: "Sistema", note: "Publicado con DOI permanente" },
    ],
  },
  {
    id: "ms-002",
    title: "Efectos del Calentamiento Global en la Distribución Altitudinal de Orquídeas Andinas",
    category: "Ecología",
    type: "Investigación Original",
    abstract: "Analizamos cambios en la distribución altitudinal de 47 especies de orquídeas andinas usando datos satelitales MODIS y observaciones de campo durante 10 años, identificando desplazamientos de 150-380 metros hacia altitudes superiores.",
    keywords: ["Cambio Climático", "Orquídeas", "Andes", "Distribución de Especies"],
    submittedByEmail: "investigador@demo.com",
    submittedByName: "Dr. Alejandro García",
    institution: "Instituto de Neurociencias, UNAM",
    coauthors: ["Dra. Isabella Cruz (UNAL)", "Dr. Fernando Quispe (UNSAAC)"],
    submittedDate: "2025-02-10",
    status: "accepted",
    assignedEditorEmail: "editor@demo.com",
    assignedEditorName: "Dra. Carmen Vidal",
    assignedJurados: [
      { email: "jurado@demo.com", name: "Dr. Marco Rinaldi", submitted: true },
    ],
    wordCount: 5234,
    pages: 14,
    comments: [
      {
        id: "c3",
        author: "Dra. Carmen Vidal",
        role: "editor",
        content: "Manuscrito aceptado. Contribución relevante para el campo de la biología de la conservación.",
        date: "2025-03-15",
      },
    ],
    timeline: [
      { status: "submitted", date: "2025-02-10", actor: "Dr. Alejandro García", actorRole: "Investigador" },
      { status: "editor_review", date: "2025-02-13", actor: "Dra. Carmen Vidal", actorRole: "Editor" },
      { status: "peer_review", date: "2025-02-20", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Enviado a revisor externo" },
      { status: "accepted", date: "2025-03-15", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Aceptado sin revisiones adicionales" },
    ],
  },
  {
    id: "ms-003",
    title: "Dinámica del Calcio Intracelular en Células T Reguladoras durante Respuesta Inmune Adaptativa",
    category: "Biología Molecular",
    type: "Investigación Original",
    abstract: "Caracterizamos los patrones de señalización de Ca²⁺ en células T reguladoras CD4+CD25+FoxP3+ mediante microscopía de fluorescencia confocal y análisis de series temporales, revelando oscilaciones sincronizadas dependientes de contacto celular.",
    keywords: ["Células T Reguladoras", "Señalización de Calcio", "Inmunología", "Microscopía Confocal"],
    submittedByEmail: "investigador@demo.com",
    submittedByName: "Dr. Alejandro García",
    institution: "Instituto de Neurociencias, UNAM",
    coauthors: ["Dra. Luz Marina Orozco (UdeA)"],
    submittedDate: "2025-03-01",
    status: "peer_review",
    assignedEditorEmail: "editor@demo.com",
    assignedEditorName: "Dra. Carmen Vidal",
    assignedJurados: [
      { email: "jurado@demo.com", name: "Dr. Marco Rinaldi", submitted: false },
      { email: "jurado3@demo.com", name: "Dr. Yuki Tanaka", submitted: false },
    ],
    wordCount: 7100,
    pages: 22,
    comments: [],
    timeline: [
      { status: "submitted", date: "2025-03-01", actor: "Dr. Alejandro García", actorRole: "Investigador" },
      { status: "editor_review", date: "2025-03-04", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Asignado a revisión editorial" },
      { status: "peer_review", date: "2025-03-12", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Enviado a 2 revisores especializados en inmunología" },
    ],
  },
  {
    id: "ms-004",
    title: "Modelado Computacional de Flujo Turbulento en Reactores de Fusión Tokamak mediante Redes Neuronales Físicamente Informadas",
    category: "Física",
    type: "Investigación Experimental",
    abstract: "Desarrollamos un modelo de red neuronal física informada (PINN) para predecir inestabilidades de flujo turbulento en plasmas de fusión tipo tokamak, logrando reducir el tiempo de cómputo en un 94% respecto a simulaciones tradicionales de elementos finitos.",
    keywords: ["Fusión Nuclear", "Plasma", "Turbulencia", "Redes Neuronales", "Tokamak"],
    submittedByEmail: "investigador@demo.com",
    submittedByName: "Dr. Alejandro García",
    institution: "Instituto de Neurociencias, UNAM",
    coauthors: [],
    submittedDate: "2025-03-20",
    status: "major_revision",
    assignedEditorEmail: "editor@demo.com",
    assignedEditorName: "Dra. Carmen Vidal",
    assignedJurados: [
      { email: "jurado@demo.com", name: "Dr. Marco Rinaldi", submitted: true },
    ],
    wordCount: 8450,
    pages: 26,
    comments: [
      {
        id: "c4",
        author: "Dr. Marco Rinaldi",
        role: "jurado",
        content: "El trabajo es prometedor pero requiere: (1) validación experimental adicional con datos ITER, (2) análisis de incertidumbre más riguroso en las predicciones del modelo, (3) comparación directa con métodos RANS establecidos.",
        date: "2025-04-10",
        isPrivate: false,
      },
      {
        id: "c5",
        author: "Dra. Carmen Vidal",
        role: "editor",
        content: "Basado en la revisión, se requieren correcciones mayores. Por favor responda punto por punto a los comentarios del revisor.",
        date: "2025-04-12",
      },
    ],
    timeline: [
      { status: "submitted", date: "2025-03-20", actor: "Dr. Alejandro García", actorRole: "Investigador" },
      { status: "editor_review", date: "2025-03-23", actor: "Dra. Carmen Vidal", actorRole: "Editor" },
      { status: "peer_review", date: "2025-03-30", actor: "Dra. Carmen Vidal", actorRole: "Editor" },
      { status: "major_revision", date: "2025-04-12", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Revisión mayor requerida por el revisor" },
    ],
  },
  {
    id: "ms-005",
    title: "Análisis Comparativo de Algoritmos de Compresión de Datos Genómicos para Secuencias de ARN de Célula Única",
    category: "Bioinformática",
    type: "Revisión Sistemática",
    abstract: "Comparamos 12 algoritmos de compresión especializados en datos scRNA-seq, evaluando métricas de compresión, tiempo de procesamiento, fidelidad de reconstrucción y compatibilidad con pipelines bioinformáticos estándar sobre conjuntos de datos de referencia.",
    keywords: ["scRNA-seq", "Compresión de Datos", "Bioinformática", "Genómica de Célula Única"],
    submittedByEmail: "investigador@demo.com",
    submittedByName: "Dr. Alejandro García",
    institution: "Instituto de Neurociencias, UNAM",
    coauthors: ["Dra. Priya Sharma (IISc Bangalore)"],
    submittedDate: "2025-04-20",
    status: "submitted",
    assignedJurados: [],
    wordCount: 9200,
    pages: 30,
    comments: [],
    timeline: [
      { status: "submitted", date: "2025-04-20", actor: "Dr. Alejandro García", actorRole: "Investigador", note: "Enviado para revisión" },
    ],
  },
  // External manuscripts (not from demo investigador)
  {
    id: "ms-006",
    title: "Estructura Electrónica de Compuestos de Alta Temperatura en Cupratos Superconductores mediante ARPES",
    category: "Física",
    type: "Carta de Investigación",
    abstract: "Medimos la estructura de bandas de cupratos superconductores de alta temperatura mediante espectroscopía de fotoemisión resuelta en ángulo (ARPES) en el sincrotrón ESRF, observando una pseudogap anisótropo en la fase subdopada.",
    keywords: ["Superconductividad", "Cupratos", "ARPES", "Estructura Electrónica"],
    submittedByEmail: "researcher2@external.com",
    submittedByName: "Dra. Elena Petrova",
    institution: "Skoltech, Moscú",
    coauthors: ["Dr. Li Wei (Tsinghua University)"],
    submittedDate: "2025-04-05",
    status: "editor_review",
    assignedEditorEmail: "editor@demo.com",
    assignedEditorName: "Dra. Carmen Vidal",
    assignedJurados: [],
    wordCount: 3200,
    pages: 8,
    comments: [
      {
        id: "c6",
        author: "Dra. Carmen Vidal",
        role: "editor",
        content: "Revisando viabilidad para envío a revisores. Resultados interesantes pero necesito verificar originalidad respecto a publicaciones recientes del grupo de Damascelli.",
        date: "2025-04-07",
        isPrivate: true,
      },
    ],
    timeline: [
      { status: "submitted", date: "2025-04-05", actor: "Dra. Elena Petrova", actorRole: "Investigador" },
      { status: "editor_review", date: "2025-04-07", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "En evaluación editorial preliminar" },
    ],
  },
  {
    id: "ms-007",
    title: "Impacto de Microplásticos en la Barrera Hematoencefálica: Estudio in vivo e in vitro",
    category: "Neurociencia",
    type: "Investigación Original",
    abstract: "Evaluamos la penetración de microplásticos de polietileno y poliestireno (50-500 nm) a través de la barrera hematoencefálica usando modelos in vivo de ratón y sistemas de órganos en chip, cuantificando acumulación y daño inflamatorio.",
    keywords: ["Microplásticos", "Barrera Hematoencefálica", "Neurotoxicología", "Órgano en Chip"],
    submittedByEmail: "researcher3@external.com",
    submittedByName: "Dr. Sebastián Mora",
    institution: "Universidad de los Andes, Colombia",
    coauthors: ["Dra. Valentina Reyes (PUC Chile)"],
    submittedDate: "2025-04-15",
    status: "peer_review",
    assignedEditorEmail: "editor@demo.com",
    assignedEditorName: "Dra. Carmen Vidal",
    assignedJurados: [
      { email: "jurado@demo.com", name: "Dr. Marco Rinaldi", submitted: false },
    ],
    wordCount: 7800,
    pages: 24,
    comments: [],
    timeline: [
      { status: "submitted", date: "2025-04-15", actor: "Dr. Sebastián Mora", actorRole: "Investigador" },
      { status: "editor_review", date: "2025-04-17", actor: "Dra. Carmen Vidal", actorRole: "Editor" },
      { status: "peer_review", date: "2025-04-22", actor: "Dra. Carmen Vidal", actorRole: "Editor", note: "Asignado a revisor especializado" },
    ],
  },
  {
    id: "ms-008",
    title: "Síntesis Verde de Nanopartículas de Plata usando Extractos de Morinda citrifolia",
    category: "Química",
    type: "Investigación Original",
    abstract: "Reportamos un método ecológico para la síntesis de nanopartículas de plata usando extractos acuosos de Morinda citrifolia (noni), logrando partículas de 8-25 nm con actividad antimicrobiana superior a nanopartículas sintetizadas químicamente.",
    keywords: ["Nanopartículas de Plata", "Síntesis Verde", "Nanoquímica", "Antimicrobiano"],
    submittedByEmail: "researcher4@external.com",
    submittedByName: "Dra. Fatima Al-Hassan",
    institution: "Universidad de Jordania",
    coauthors: [],
    submittedDate: "2025-04-18",
    status: "submitted",
    assignedJurados: [],
    wordCount: 4500,
    pages: 12,
    comments: [],
    timeline: [
      { status: "submitted", date: "2025-04-18", actor: "Dra. Fatima Al-Hassan", actorRole: "Investigador", note: "Envío inicial" },
    ],
  },
];

export function getInitialManuscripts(): Manuscript[] {
  return JSON.parse(JSON.stringify(mockManuscripts));
}

export const ALL_USERS = [
  { id: "u1", name: "Dr. Alejandro García", email: "investigador@demo.com", role: "investigador" as const, institution: "UNAM", joined: "2024-09-01", manuscripts: 5 },
  { id: "u2", name: "Dra. Carmen Vidal", email: "editor@demo.com", role: "editor" as const, institution: "SaberUnerg", joined: "2023-01-15", manuscripts: 0 },
  { id: "u3", name: "Dr. Marco Rinaldi", email: "jurado@demo.com", role: "jurado" as const, institution: "INFN Pisa", joined: "2023-06-10", manuscripts: 0 },
  { id: "u4", name: "Admin SaberUnerg", email: "admin@demo.com", role: "admin" as const, institution: "SaberUnerg", joined: "2022-01-01", manuscripts: 0 },
  { id: "u5", name: "Dra. Elena Petrova", email: "researcher2@external.com", role: "investigador" as const, institution: "Skoltech", joined: "2024-11-20", manuscripts: 1 },
  { id: "u6", name: "Dr. Sebastián Mora", email: "researcher3@external.com", role: "investigador" as const, institution: "Uniandes", joined: "2025-01-08", manuscripts: 1 },
  { id: "u7", name: "Dra. Fatima Al-Hassan", email: "researcher4@external.com", role: "investigador" as const, institution: "U. Jordania", joined: "2025-02-14", manuscripts: 1 },
  { id: "u8", name: "Dra. Ana Torres", email: "jurado2@demo.com", role: "jurado" as const, institution: "IFC-Valencia", joined: "2023-09-01", manuscripts: 0 },
];
