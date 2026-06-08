export interface Author {
  name: string;
  institution: string;
  email?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  categoryColor: string;
  type: string;
  authors: Author[];
  date: string;
  doi: string;
  abstract: string;
  image: string;
  tags: string[];
  readTime: string;
  featured?: boolean;
  heroFeatured?: boolean;
  volume?: string;
  issue?: string;
  pages?: string;
  sections?: { title: string; content: string }[];
  quote?: string;
  figureCaption?: string;
  figureImage?: string;
  stat?: string;
  statLabel?: string;
  views?: number;
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "simetria-oculta-redes-neuronales",
    title: "La Simetría Oculta de las Redes Neuronales Celulares",
    subtitle: "The Hidden Symmetry of Cellular Neural Networks. An exploration into the fundamental architectures of living biological computation.",
    category: "Biología",
    categoryColor: "#3ecf8e",
    type: "INVESTIGACIÓN DESTACADA",
    authors: [{ name: "Dr. Elena Torres", institution: "Instituto de Neurobiología Celular, UNAM" }],
    date: "Octubre 2024",
    doi: "10.1038/cienceduc.2024.0891",
    abstract: "Presentamos evidencia de patrones simétricos en las redes de comunicación neuronal a nivel celular, revelando una arquitectura computacional subyacente que desafía los modelos clásicos de procesamiento de información biológica.",
    image: "https://images.unsplash.com/photo-1748520109126-9e1ada959feb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrJTIwY2VsbHMlMjBkYXJrJTIwYmFja2dyb3VuZCUyMGdsb3dpbmd8ZW58MXx8fHwxNzc3MTQzMDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Neurobiología", "Redes Celulares", "Computación Biológica", "Simetría"],
    readTime: "14 Min de lectura",
    featured: true,
    heroFeatured: true,
    volume: "14",
    issue: "2",
    pages: "88–104",
    sections: [
      { title: "Introducción", content: "La teoría de redes neuronales celulares ha permanecido fragmentada durante décadas. Los modelos convencionales asumen una comunicación asimétrica y esencialmente estocástica entre neuronas adyacentes. Sin embargo, análisis recientes de datos de conectómica de alta resolución sugieren la existencia de patrones geométricos altamente ordenados que emergen de manera espontánea en condiciones fisiológicas normales." },
      { title: "Metodología Analítica", content: "Utilizando imágenes de microscopía electrónica de transmisión criogénica (cryo-TEM) a resolución nanométrica, combinadas con algoritmos de detección de patrones basados en transformadas de Fourier adaptativas, analizamos 47 muestras de tejido cortical de sujetos sanos." },
      { title: "Resultados", content: "Identificamos tres clases de simetría principal: rotacional (eje de 6 veces), especular y translacional. La clase rotacional fue la más prevalente, apareciendo en el 73% de las muestras analizadas con un umbral de confianza del 95%." },
      { title: "Conclusión", content: "La simetría en redes neuronales celulares no es un artefacto del procesamiento de imágenes, sino una propiedad emergente real del tejido nervioso vivo." }
    ],
    quote: "\"La simetría no es un ornamento de la naturaleza — es su gramática más profunda.\"",
    figureCaption: "Figura 1: Mapa de conectividad neuronal mostrando patrones de simetría rotacional de orden 6. Escala: 50μm.",
    figureImage: "https://images.unsplash.com/photo-1603054400223-7c796e60ba9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwYnJhaW4lMjBuZXVyb25zJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzc3MTQzMDUzfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "2",
    slug: "plegamiento-proteico-ia",
    title: "Plegamiento Proteico Asistido por IA",
    subtitle: "AI-Assisted Protein Folding Structures",
    category: "Biología Molecular",
    categoryColor: "#3ecf8e",
    type: "INVESTIGACIÓN ORIGINAL",
    authors: [{ name: "Dra. María López", institution: "Centro de Biología Estructural, Barcelona" }],
    date: "8 de Nov, 2024",
    doi: "10.1038/cienceduc.2024.1102",
    abstract: "Presentamos un nuevo algoritmo de aprendizaje profundo que predice la estructura terciaria de proteínas con una precisión superior al 94%, superando los métodos anteriores en proteínas de más de 500 aminoácidos.",
    image: "https://images.unsplash.com/photo-1740676378809-cb2a24feecdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwc3RydWN0dXJlJTIwbW9sZWN1bGFyJTIwdmlzdWFsaXphdGlvbnxlbnwxfHx8fDE3NzcxNDMwNTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Proteómica", "Inteligencia Artificial", "AlphaFold", "Bioinformática"],
    readTime: "11 Min de lectura",
    volume: "14",
    issue: "3",
    pages: "112–130",
    sections: [
      { title: "Introducción", content: "El problema del plegamiento proteico ha sido uno de los desafíos más complejos de la biología molecular durante más de cinco décadas." },
      { title: "Metodología", content: "Desarrollamos ProFoldNet, una arquitectura de transformer con atención multi-escala que integra información evolutiva, coevolucionaria y fisicoquímica." },
      { title: "Resultados", content: "ProFoldNet alcanzó un GDT_TS de 94.2 en CASP15, superando en 3.7 puntos el rendimiento del estado del arte previo." },
      { title: "Conclusión", content: "ProFoldNet establece un nuevo estándar en predicción de estructura proteica y abre la puerta al diseño racional de fármacos a escala sin precedentes." }
    ],
    quote: "\"Comprender el plegamiento es comprender la vida misma en su forma más elemental.\"",
    figureCaption: "Figura 1: Comparación de estructuras predichas vs. cristalografía de rayos X para 200 proteínas de prueba.",
    figureImage: "https://images.unsplash.com/photo-1580795479025-93d13fd9aa6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxETkElMjBtb2xlY3VsYXIlMjBiaW9sb2d5JTIwcmVzZWFyY2h8ZW58MXx8fHwxNzc3MTQzMDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "3",
    slug: "anomalias-espectro-cuasares",
    title: "Anomalías en el Espectro de Cuásares",
    subtitle: "Quasar Spectrum Anomalies detected in Sector 4",
    category: "Astrofísica",
    categoryColor: "#6c8ebf",
    type: "CARTA DE INVESTIGACIÓN",
    heroFeatured: true,
    authors: [{ name: "Dr. Carlos Mendoza", institution: "Observatorio Nacional, Ciudad de México" }],
    date: "22 de Oct, 2024",
    doi: "10.1038/cienceduc.2024.0743",
    abstract: "Reportamos anomalías espectrales sistemáticas en una muestra de 312 cuásares observados con el telescopio James Webb, inconsistentes con los modelos estándar de emisión de discos de acreción.",
    image: "https://images.unsplash.com/photo-1618863912461-b99cf4e562bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWxlc2NvcGUlMjBhc3Ryb25vbXklMjBzcGFjZSUyMGRhcmt8ZW58MXx8fHwxNzc3MTQzMDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Cuásares", "Espectroscopía", "James Webb", "Cosmología"],
    readTime: "9 Min de lectura",
    sections: [
      { title: "Observaciones", content: "Durante el ciclo de observación 2024-A del JWST, detectamos excesos de emisión en la banda de 2.3–3.1 micrómetros en 312 de 1,050 cuásares de muestra." },
      { title: "Interpretaciones", content: "Tres hipótesis compiten: contaminación por lentes gravitacionales no identificadas, emisión de polvo caliente, y procesos físicos exóticos en el entorno del agujero negro supermasivo." },
      { title: "Conclusión", content: "Las anomalías requieren revisión de los modelos estándar de cuásares." }
    ],
    quote: "\"El universo guarda secretos en la luz que emiten sus objetos más violentos.\"",
    figureCaption: "Figura 1: Distribución espectral de energía de 20 cuásares anómalos vs. muestra control.",
    figureImage: "https://images.unsplash.com/photo-1739801567575-ad8498ecb015?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWFudHVtJTIwcGh5c2ljcyUyMHBhcnRpY2xlcyUyMGFic3RyYWN0JTIwYmx1ZXxlbnwxfHx8fDE3NzcxNDMwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "4",
    slug: "entrelazamiento-escala-macroscopica",
    title: "Entrelazamiento a Escala Macroscópica",
    subtitle: "Macroscopic Scale Entanglement. Challenging traditional limits of quantum mechanics.",
    category: "Física Cuántica",
    categoryColor: "#9b7fd4",
    type: "INVESTIGACIÓN EXPERIMENTAL",
    heroFeatured: true,
    authors: [{ name: "Dr. Javier Ruiz", institution: "Instituto de Física, ETH Zúrich" }],
    date: "10 de Nov, 2024",
    doi: "10.1038/cienceduc.2024.0921",
    abstract: "Un nuevo estudio empírico desafía las limitaciones tradicionales de la mecánica cuántica, observando coherencia a niveles nunca antes medidos en laboratorios terrestres a temperatura ambiente.",
    image: "https://images.unsplash.com/photo-1739801567575-ad8498ecb015?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWFudHVtJTIwcGh5c2ljcyUyMHBhcnRpY2xlcyUyMGFic3RyYWN0JTIwYmx1ZXxlbnwxfHx8fDE3NzcxNDMwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Entrelazamiento", "Mecánica Cuántica", "Coherencia", "Temperatura Ambiente"],
    readTime: "12 Min de lectura",
    sections: [
      { title: "Motivación", content: "El entrelazamiento cuántico ha sido observado hasta ahora a escalas atómicas y moleculares, típicamente en condiciones de temperatura ultrabajas." },
      { title: "Experimento", content: "Diseñamos un sistema de óptica cuántica que utiliza cavidades resonantes de silicio fotónico para preservar la coherencia cuántica durante 2.3 milisegundos a 293 K." },
      { title: "Implicaciones", content: "Este resultado tiene implicaciones directas para el desarrollo de memorias cuánticas a temperatura ambiente." }
    ],
    quote: "\"Lo que observamos no es la naturaleza misma, sino la naturaleza expuesta a nuestro método de interrogación.\"",
    figureCaption: "Figura 1: Tomografía de estado cuántico mostrando fidelidad de entrelazamiento > 0.97 a temperatura ambiente.",
    figureImage: "https://images.unsplash.com/photo-1628863353691-0071c8c1874c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBsYWJvcmF0b3J5JTIwZmxhc2slMjBleHBlcmltZW50fGVufDF8fHx8MTc3NzE0MzA0OHww&ixlib=rb-4.1.0&q=80&w=1080",
    stat: "97%",
    statLabel: "FIDELIDAD DE ENTRELAZAMIENTO"
  },
  {
    id: "5",
    slug: "sesgo-cognitivo-evaluacion",
    title: "El sesgo cognitivo en la evaluación estandarizada: Un análisis a gran escala",
    subtitle: "Cognitive bias in standardized assessment: a large-scale analysis.",
    category: "Metodología",
    categoryColor: "#e07b54",
    type: "ENSAYO CRÍTICO",
    authors: [{ name: "Dra. Elena Rostros", institution: "Facultad de Psicología, UAM" }],
    date: "12 de Nov, 2024",
    doi: "10.1038/cienceduc.2024.1033",
    abstract: "Un análisis a gran escala de 2.4 millones de exámenes estandarizados revela patrones sistemáticos de sesgo que correlacionan con variables socioeconómicas independientemente del conocimiento evaluado.",
    image: "https://images.unsplash.com/photo-1502485019198-a625bd53ceb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwc2NpZW5jZSUyMHJlc2VhcmNoJTIwbGlicmFyeSUyMGJvb2tzJTIwYWNhZGVtaWN8ZW58MXx8fHwxNzc3MTQzMDU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Educación", "Sesgo Cognitivo", "Evaluación", "Psicometría"],
    readTime: "10 Min de lectura",
    stat: "84%",
    statLabel: "CORRELACIÓN EMPÍRICA CON NIVEL SOCIOECONÓMICO",
    sections: [
      { title: "Planteamiento", content: "Los sistemas de evaluación estandarizada son pilares del sistema educativo moderno, pero su supuesta neutralidad ha sido cuestionada por investigaciones parciales." },
      { title: "Datos y Métodos", content: "Analizamos 2.4 millones de exámenes de acceso universitario en 12 países hispanohablantes entre 2019 y 2023." },
      { title: "Hallazgos Principales", content: "El 84% de la varianza en las diferencias de rendimiento entre grupos socioeconómicos no puede explicarse por diferencias en el conocimiento adquirido." }
    ],
    quote: "\"La pedagogía moderna no puede sostenerse sobre la mera intuición; exige validación.\"",
    figureCaption: "Figura 1: Curvas de característica del ítem (ICC) para 50 preguntas con mayor diferencial de funcionamiento.",
    figureImage: "https://images.unsplash.com/photo-1699451017819-a12db2d3abee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwY2hhbmdlJTIwZW52aXJvbm1lbnQlMjBzY2llbmNlJTIwZGF0YXxlbnwxfHx8fDE3NzcxNDMwNTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "6",
    slug: "etica-algoritmo-tutoria",
    title: "La ética del algoritmo en la tutoría automatizada",
    subtitle: "The ethics of algorithm in automated tutoring. Philosophical frontiers in the application of AI in education.",
    category: "Metodología",
    categoryColor: "#e07b54",
    type: "ENSAYO CRÍTICO",
    authors: [{ name: "Dr. Juan Moreno", institution: "Cátedra de Filosofía de la Tecnología, UC3M" }],
    date: "5 de Nov, 2024",
    doi: "10.1038/cienceduc.2024.0988",
    abstract: "Examinamos las implicaciones éticas de los sistemas de tutoría adaptativa basados en IA, argumentando que la transparencia algorítmica no es opcional sino un imperativo pedagógico fundamental.",
    image: "https://images.unsplash.com/photo-1628863353691-0071c8c1874c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBsYWJvcmF0b3J5JTIwZmxhc2slMjBleHBlcmltZW50fGVufDF8fHx8MTc3NzE0MzA0OHww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["IA en Educación", "Ética Algorítmica", "Tutoría Adaptativa", "Transparencia"],
    readTime: "8 Min de lectura",
    sections: [
      { title: "El Problema de la Caja Negra", content: "Los sistemas de tutoría adaptativa modernos operan como cajas negras que toman decisiones pedagógicas sin explicación comprensible para estudiantes ni docentes." },
      { title: "Marco Ético Propuesto", content: "Proponemos el principio de 'explicabilidad pedagógica': todo sistema de IA en educación debe poder articular las razones detrás de cada intervención pedagógica." }
    ],
    quote: "\"Un algoritmo que no puede explicarse a sí mismo no debería tener autoridad sobre la mente humana.\"",
    figureCaption: "Figura 1: Marco de transparencia algorítmica para sistemas de tutoría adaptativa.",
    figureImage: "https://images.unsplash.com/photo-1603054400223-7c796e60ba9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwYnJhaW4lMjBuZXVyb25zJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzc3MTQzMDUzfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "7",
    slug: "nuevos-paradigmas-datos-cualitativos",
    title: "Nuevos paradigmas en la recolección de datos cualitativos",
    subtitle: "New paradigms in qualitative data collection. A comprehensive review of digital ethnographic tools.",
    category: "Metodología",
    categoryColor: "#e07b54",
    type: "REVISIÓN SISTEMÁTICA",
    authors: [{ name: "Dr. Arturo Méndez", institution: "Facultad de Ciencias Sociales, UBA" }],
    date: "18 de Oct, 2024",
    doi: "10.1038/cienceduc.2024.0901",
    abstract: "Una revisión exhaustiva de las herramientas etnográficas digitales y su impacto en la validez y rigor de la investigación cualitativa contemporánea.",
    image: "https://images.unsplash.com/photo-1699451017819-a12db2d3abee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwY2hhbmdlJTIwZW52aXJvbm1lbnQlMjBzY2llbmNlJTIwZGF0YXxlbnwxfHx8fDE3NzcxNDMwNTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Etnografía Digital", "Metodología Cualitativa", "Big Data Cualitativo"],
    readTime: "7 Min de lectura",
    sections: [
      { title: "Panorama Actual", content: "La etnografía digital ha evolucionado desde simples observaciones en foros en línea hasta análisis multi-plataforma que integran texto, imagen, audio y metadatos comportamentales en tiempo real." },
      { title: "Herramientas Emergentes", content: "Revisamos 34 plataformas de investigación cualitativa digital publicadas entre 2020 y 2024." }
    ],
    quote: "\"Los datos cualitativos no son menos rigurosos — requieren un rigor diferente.\"",
    figureCaption: "Figura 1: Mapa de herramientas de investigación cualitativa digital por dimensión metodológica.",
    figureImage: "https://images.unsplash.com/photo-1502485019198-a625bd53ceb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwc2NpZW5jZSUyMHJlc2VhcmNoJTIwbGlicmFyeSUyMGJvb2tzJTIwYWNhZGVtaWN8ZW58MXx8fHwxNzc3MTQzMDU1fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "8",
    slug: "simbiosis-celular-evolucion",
    title: "La Simbiosis Celular y su Impacto en la Evolución Moderna",
    subtitle: "Cellular Symbiosis and its Impact on Modern Evolution",
    category: "Biología Molecular",
    categoryColor: "#3ecf8e",
    type: "INVESTIGACIÓN ORIGINAL",
    heroFeatured: true,
    authors: [{ name: "Dra. Elena Vargas", institution: "Instituto de Biociencias, USP" }],
    date: "14 Octubre, 2024",
    doi: "10.1038/cienceduc.2024.1102",
    abstract: "La teoría endosimbiótica, propuesta inicialmente por Lynn Margulis, ha transformado nuestra comprensión de la evolución eucariota. Estudios recientes sobre organismos extremófilos sugieren que las relaciones simbióticas son mucho más dinámicas y reversibles de lo postulado.",
    image: "https://images.unsplash.com/photo-1761652661873-a08d8cb25b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJvcmF0b3J5JTIwbWljcm9zY29wZSUyMHNjaWVuY2UlMjBkYXJrfGVufDF8fHx8MTc3NzE0MzA0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Endosimbiosis", "Evolución", "Microbioma", "Genómica"],
    readTime: "16 Min de lectura",
    volume: "14",
    issue: "2",
    pages: "112–130",
    sections: [
      { title: "Introducción", content: "La teoría endosimbiótica ha transformado nuestra comprensión de la evolución eucariota. Estudios recientes sobre organismos extremófilos en fuentes hidrotermales profundas sugieren que las relaciones simbióticas a nivel celular son mucho más dinámicas y reversibles de lo postulado." },
      { title: "Metodología Analítica", content: "Las muestras fueron recolectadas a 2,400 metros de profundidad en la Falla de Galápagos. Se extrajo ADN metagenómico utilizando protocolos modificados para alta salinidad y presión." },
      { title: "Resultados y Discusión", content: "El análisis filogenómico reveló que más del 18% del genoma de los eucariotas basales estudiados está compuesto por elementos transponibles de origen arqueo reciente." },
      { title: "Conclusión", content: "Los resultados exigen una revisión de la taxonomía basada estrictamente en la divergencia clonal." }
    ],
    quote: "\"La simbiosis no es un evento congelado en el tiempo, sino un espectro continuo de negociación genética intercelular.\"",
    figureCaption: "Figura 1: Topografía de membrana evidenciando zonas de intercambio genético activo. Aumento: 45,000×",
    figureImage: "https://images.unsplash.com/photo-1761652661873-a08d8cb25b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJvcmF0b3J5JTIwbWljcm9zY29wZSUyMHNjaWVuY2UlMjBkYXJrfGVufDF8fHx8MTc3NzE0MzA0Nnww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "9",
    slug: "microbioma-intestinal-sistema-nervioso",
    title: "El Microbioma Intestinal como Regulador del Sistema Nervioso Central",
    subtitle: "Gut Microbiome as a Regulator of the Central Nervous System. New evidence from bidirectional gut-brain axis modulation.",
    category: "Neurociencia",
    categoryColor: "#3ecf8e",
    type: "INVESTIGACIÓN ORIGINAL",
    authors: [{ name: "Dra. Isabel Ferrer", institution: "Instituto de Neurociencias, CSIC-Madrid" }],
    date: "3 de Dic, 2024",
    doi: "10.1038/cienceduc.2024.1201",
    abstract: "Demostramos que modificaciones específicas en la composición del microbioma intestinal inducen cambios medibles en la neurotransmisión serotoninérgica, con implicaciones directas para el tratamiento de trastornos del estado de ánimo resistentes a la farmacoterapia convencional.",
    image: "https://images.unsplash.com/photo-1640941295021-a2f78b997312?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb2Jpb21lJTIwZ3V0JTIwYnJhaW4lMjBzY2llbmNlJTIwZGFya3xlbnwxfHx8fDE3NzcxNDQ0Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Microbioma", "Eje Intestino-Cerebro", "Serotonina", "Neuropsiquiatría"],
    readTime: "13 Min de lectura",
    sections: [
      { title: "Introducción", content: "El eje intestino-cerebro ha emergido como uno de los sistemas de comunicación bidireccional más complejos del organismo humano. La microbiota intestinal modula la actividad del nervio vago, la síntesis de neurotransmisores y la permeabilidad de la barrera hematoencefálica a través de mecanismos moleculares aún parcialmente incomprendidos." },
      { title: "Metodología", content: "Empleamos un diseño de trasplante de microbiota fecal (TMF) en modelos murinos germ-free, seguido de secuenciación metagenómica 16S y mediciones de metabolómica plasmática por espectrometría de masas acoplada a cromatografía líquida." },
      { title: "Resultados", content: "La colonización con microbiota de donantes con diagnóstico de depresión mayor indujo comportamientos ansiosos en el 78% de los animales receptores, acompañados de reducciones del 34% en los niveles hipocampales de serotonina." },
      { title: "Conclusión", content: "Nuestros resultados apoyan la hipótesis del microbioma como diana terapéutica para trastornos neuropsiquiátricos y abren la puerta a intervenciones probióticas personalizadas." }
    ],
    quote: "\"La mente no termina en el cerebro — el intestino también piensa.\"",
    figureCaption: "Figura 1: Correlación entre diversidad microbiana (índice Shannon) y niveles de serotonina hipocampal.",
    figureImage: "https://images.unsplash.com/photo-1640941295021-a2f78b997312?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb2Jpb21lJTIwZ3V0JTIwYnJhaW4lMjBzY2llbmNlJTIwZGFya3xlbnwxfHx8fDE3NzcxNDQ0Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "10",
    slug: "distribucion-materia-oscura-cumulos",
    title: "Distribución de Materia Oscura en Cúmulos de Galaxias: Nuevas Observaciones",
    subtitle: "Dark Matter Distribution in Galaxy Clusters. Evidence from gravitational lensing surveys across 1,200 clusters.",
    category: "Astrofísica",
    categoryColor: "#6c8ebf",
    type: "INVESTIGACIÓN OBSERVACIONAL",
    authors: [
      { name: "Dr. Ramón Espinoza", institution: "Instituto de Astrofísica de Canarias" },
      { name: "Dra. Li Xin", institution: "National Astronomical Observatories of China" }
    ],
    date: "19 de Nov, 2024",
    doi: "10.1038/cienceduc.2024.1156",
    abstract: "Mediante lentes gravitacionales débiles aplicadas a 1,200 cúmulos de galaxias del relevamiento HSC-SSP, trazamos la distribución tridimensional de materia oscura con una resolución angular sin precedentes, revelando subestructuras filamentosas no predichas por simulaciones estándar.",
    image: "https://images.unsplash.com/photo-1761232007928-258c9bd98d66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbWF0dGVyJTIwY29zbW9zJTIwdW5pdmVyc2UlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzcxNDQ0NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Materia Oscura", "Lentes Gravitacionales", "Cúmulos de Galaxias", "Cosmología"],
    readTime: "15 Min de lectura",
    sections: [
      { title: "Contexto Observacional", content: "La naturaleza de la materia oscura permanece como uno de los misterios más persistentes de la física moderna. Representa el 27% del contenido energético del universo, pero no interactúa con la luz electromagnética, haciéndola detectable sólo indirectamente a través de sus efectos gravitacionales." },
      { title: "Resultados Principales", content: "Identificamos 847 subestructuras filamentosas dentro de los halos de materia oscura de los cúmulos analizados, con masas en el rango 10^11–10^13 masas solares, incompatibles con las predicciones del modelo ΛCDM estándar." },
      { title: "Implicaciones Cosmológicas", content: "Estos hallazgos sugieren la necesidad de incorporar interacciones entre partículas de materia oscura en los modelos estándar, o alternativamente, revisar los parámetros de la gravedad en escalas de megapársecs." }
    ],
    quote: "\"Lo invisible da forma a lo visible — así trabaja la materia oscura en el cosmos.\"",
    figureCaption: "Figura 1: Mapa de masa proyectada de cúmulo representativo mostrando filamentos de materia oscura. FOV: 15 Mpc.",
    figureImage: "https://images.unsplash.com/photo-1761232007928-258c9bd98d66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbWF0dGVyJTIwY29zbW9zJTIwdW5pdmVyc2UlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzcxNDQ0NDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "11",
    slug: "crispr-cas13d-edicion-somatica",
    title: "Edición Genómica de Precisión mediante CRISPR-Cas13d en Células Somáticas",
    subtitle: "Precision Genomic Editing via CRISPR-Cas13d in Somatic Cells. Targeting RNA without permanent DNA modification.",
    category: "Biología Molecular",
    categoryColor: "#3ecf8e",
    type: "INVESTIGACIÓN ORIGINAL",
    authors: [{ name: "Dr. Pablo Reyes", institution: "Broad Institute, MIT-Harvard" }],
    date: "27 de Nov, 2024",
    doi: "10.1038/cienceduc.2024.1178",
    abstract: "Desarrollamos un protocolo de edición de ARN mensajero usando Cas13d con una especificidad del 99.7%, sin modificación permanente del ADN genómico, eliminando el riesgo de mutaciones fuera de diana en terapia génica somática.",
    image: "https://images.unsplash.com/photo-1641903202531-bfa6bf0c6419?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDUklTUFIlMjBnZW5lJTIwZWRpdGluZyUyMEROQSUyMGxhYm9yYXRvcnl8ZW58MXx8fHwxNzc3MTQ0NDQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["CRISPR", "Cas13d", "Edición de ARN", "Terapia Génica"],
    readTime: "17 Min de lectura",
    volume: "14",
    issue: "4",
    pages: "203–224",
    sections: [
      { title: "Introducción", content: "CRISPR-Cas9 revolucionó la biología molecular, pero su edición permanente del ADN conlleva riesgos de mutaciones fuera de diana con potencial oncogénico. Cas13d, que actúa sobre ARN, ofrece una alternativa reversible y transient para corregir errores de expresión génica sin modificar el genoma." },
      { title: "Estrategia Experimental", content: "Diseñamos ARN guías de alta afinidad contra 15 transcritos patológicos asociados a enfermedades monogénicas raras. Los complejos Cas13d-ARN guía fueron encapsulados en nanopartículas lipídicas ionizables de nueva generación para delivery eficiente." },
      { title: "Eficacia y Seguridad", content: "Alcanzamos un knockdown del transcrito objetivo superior al 94% en células primarias humanas, con una tasa de eventos fuera de diana del 0.3% según secuenciación transcriptómica de alto rendimiento. Sin evidencia de toxicidad celular a dosis terapéuticas." }
    ],
    quote: "\"Editar el ARN, no el ADN: la corrección sin consecuencias permanentes.\"",
    figureCaption: "Figura 1: Eficiencia de knockdown de Cas13d vs. siRNA para 15 transcritos diana en hepatocitos primarios.",
    figureImage: "https://images.unsplash.com/photo-1641903202531-bfa6bf0c6419?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDUklTUFIlMjBnZW5lJTIwZWRpdGluZyUyMEROQSUyMGxhYm9yYXRvcnl8ZW58MXx8fHwxNzc3MTQ0NDQwfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "12",
    slug: "modelos-climaticos-alta-resolucion-2100",
    title: "Modelos Climáticos de Alta Resolución para Proyecciones al Año 2100",
    subtitle: "High-Resolution Climate Models for Year 2100 Projections. Regional disaggregation of IPCC AR6 scenarios.",
    category: "Metodología",
    categoryColor: "#e07b54",
    type: "REVISIÓN SISTEMÁTICA",
    authors: [{ name: "Dra. Carmen Vidal", institution: "Centro de Investigación Atmosférica, CICESE" }],
    date: "10 de Dic, 2024",
    doi: "10.1038/cienceduc.2024.1234",
    abstract: "Evaluamos quince modelos climáticos de alta resolución regional frente a datos observacionales históricos 1950–2024, identificando las configuraciones que mejor capturan la variabilidad climática en América Latina bajo escenarios SSP2-4.5 y SSP5-8.5.",
    image: "https://images.unsplash.com/photo-1579818191106-a46212ac32be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwbW9kZWwlMjBlYXJ0aCUyMGRhdGElMjB2aXN1YWxpemF0aW9ufGVufDF8fHx8MTc3NzE0NDQ0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Cambio Climático", "Modelos Climáticos", "IPCC", "Proyecciones Regionales"],
    readTime: "12 Min de lectura",
    sections: [
      { title: "Contexto", content: "Las proyecciones climáticas globales del IPCC ofrecen resoluciones espaciales insuficientes para la planificación de adaptación a nivel regional y local. La reducción de escala dinámica mediante modelos climáticos regionales (RCM) es esencial para traducir incertidumbres globales en información accionable." },
      { title: "Evaluación de Modelos", content: "Aplicamos métricas de verificación estándar (RMSE, correlación de Pearson, índice de habilidad de Taylor) a 15 RCMs para precipitación y temperatura en cuatro subregiones de América Latina." },
      { title: "Proyecciones Consensuadas", content: "El ensamble multi-modelo indica aumentos de temperatura de 2.1–4.7°C hacia 2100 en la región amazónica bajo SSP5-8.5, con reducciones de precipitación del 15–28% en el corredor seco mesoamericano." }
    ],
    quote: "\"Proyectar el clima es también proyectar el futuro de las civilizaciones que dependen de él.\"",
    figureCaption: "Figura 1: Proyecciones de temperatura y precipitación para América Latina bajo cuatro escenarios SSP al año 2100.",
    figureImage: "https://images.unsplash.com/photo-1579818191106-a46212ac32be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwbW9kZWwlMjBlYXJ0aCUyMGRhdGElMjB2aXN1YWxpemF0aW9ufGVufDF8fHx8MTc3NzE0NDQ0MHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "13",
    slug: "criptografia-cuantica-entrelazamiento",
    title: "Criptografía Cuántica Basada en Entrelazamiento Fotónico de Larga Distancia",
    subtitle: "Quantum Cryptography via Long-Distance Photonic Entanglement. Breaking the 1,000 km barrier.",
    category: "Física Cuántica",
    categoryColor: "#9b7fd4",
    type: "INVESTIGACIÓN EXPERIMENTAL",
    authors: [{ name: "Dr. Hiroshi Tanaka", institution: "Toshiba Research Europe / Keio University" }],
    date: "15 de Dic, 2024",
    doi: "10.1038/cienceduc.2024.1289",
    abstract: "Demostramos distribución de claves cuánticas (QKD) con tasa de error de 0.8% a través de 1,200 km de fibra óptica, superando el récord mundial anterior mediante repetidores cuánticos basados en memorias atómicas de alta fidelidad.",
    image: "https://images.unsplash.com/photo-1667482818773-55ce7139c505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWFudHVtJTIwY3J5cHRvZ3JhcGh5JTIwbGFzZXIlMjBvcHRpY3N8ZW58MXx8fHwxNzc3MTQ0NDQxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Criptografía Cuántica", "QKD", "Entrelazamiento Fotónico", "Seguridad Cuántica"],
    readTime: "14 Min de lectura",
    sections: [
      { title: "El Reto de la Distancia", content: "La decoherencia y las pérdidas en la fibra óptica limitan la distancia práctica de los sistemas QKD actuales a menos de 500 km sin repetidores. Superar esta barrera es fundamental para las redes de comunicación cuántica intercontinentales." },
      { title: "Arquitectura del Sistema", content: "Implementamos una cadena de 4 repetidores cuánticos espaciados cada 300 km, cada uno basado en memorias atómicas de rubidio enfriado a 10 μK conectadas a convertidores de frecuencia cuántica para compatibilidad con fibra estándar de telecomunicaciones." },
      { title: "Rendimiento y Seguridad", content: "La tasa de generación de claves seguras alcanzó 1.2 kbps a 1,200 km, suficiente para cifrado de voz y datos de baja velocidad. El sistema resistió ataques de intercepción simulados con detección inmediata." }
    ],
    quote: "\"La comunicación cuántica no promete secretos perfectos — los garantiza por las leyes de la física.\"",
    figureCaption: "Figura 1: Arquitectura del enlace QKD de 1,200 km con repetidores cuánticos y tasa de error de bit cuántico (QBER).",
    figureImage: "https://images.unsplash.com/photo-1667482818773-55ce7139c505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWFudHVtJTIwY3J5cHRvZ3JhcGh5JTIwbGFzZXIlMjBvcHRpY3N8ZW58MXx8fHwxNzc3MTQ0NDQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "14",
    slug: "redes-convolucionales-diagnostico-oncologico",
    title: "Diagnóstico Oncológico con Redes Convolucionales: Análisis de 2,300 Casos Clínicos",
    subtitle: "Oncological Diagnosis with Convolutional Networks. A multi-center prospective validation study.",
    category: "Biología",
    categoryColor: "#3ecf8e",
    type: "ESTUDIO CLÍNICO",
    authors: [
      { name: "Dra. Sofía Ramos", institution: "Hospital Clínico San Carlos, Madrid" },
      { name: "Dr. Thomas Laurent", institution: "Institut Curie, Paris" }
    ],
    date: "20 de Ene, 2025",
    doi: "10.1038/cienceduc.2025.0023",
    abstract: "Una red neuronal convolucional entrenada en 180,000 imágenes histopatológicas logró una sensibilidad del 97.3% y especificidad del 96.1% para el diagnóstico de carcinoma ductal in situ, superando el acuerdo interobservador entre patólogos expertos.",
    image: "https://images.unsplash.com/photo-1666214275172-ccc3b98e5519?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNoaW5lJTIwbGVhcm5pbmclMjBtZWRpY2FsJTIwc2NhbiUyMGhvc3BpdGFsfGVufDF8fHx8MTc3NzE0NDQ0MXww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Inteligencia Artificial", "Oncología", "Histopatología", "Diagnóstico Digital"],
    readTime: "11 Min de lectura",
    stat: "97.3%",
    statLabel: "SENSIBILIDAD DIAGNÓSTICA EN CARCINOMA DUCTAL",
    sections: [
      { title: "Motivación Clínica", content: "La escasez global de patólogos especializados y la variabilidad interobservador en el diagnóstico histológico representan barreras críticas para el acceso equitativo a diagnóstico oncológico de calidad." },
      { title: "Diseño del Estudio", content: "Reclutamos 2,300 pacientes de 7 centros hospitalarios en España y Francia. Las imágenes digitalizadas de biopsias fueron evaluadas ciegamente por el modelo y por un panel de tres patólogos expertos." },
      { title: "Resultados Clínicos", content: "El modelo redujo en 47% el tiempo de diagnóstico y aumentó la detección de lesiones de bajo grado previamente pasadas por alto en el 12% de los casos revisados por patólogos." }
    ],
    quote: "\"La IA en patología no reemplaza al médico — amplifica su capacidad de ver lo invisible.\"",
    figureCaption: "Figura 1: Curvas ROC del modelo vs. panel de patólogos para cinco subtipos tumorales.",
    figureImage: "https://images.unsplash.com/photo-1666214275172-ccc3b98e5519?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNoaW5lJTIwbGVhcm5pbmclMjBtZWRpY2FsJTIwc2NhbiUyMGhvc3BpdGFsfGVufDF8fHx8MTc3NzE0NDQ0MXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "15",
    slug: "paradoja-informacion-agujeros-negros",
    title: "El Horizonte de Eventos y la Paradoja de la Información: Estado Actual del Debate",
    subtitle: "The Event Horizon and the Information Paradox. Resolving the black hole information problem through holography.",
    category: "Astrofísica",
    categoryColor: "#6c8ebf",
    type: "REVISIÓN SISTEMÁTICA",
    authors: [{ name: "Dr. Alejandro Díaz", institution: "Instituto Balseiro, CNEA-Argentina" }],
    date: "8 de Feb, 2025",
    doi: "10.1038/cienceduc.2025.0089",
    abstract: "Revisamos el estado actual de la paradoja de la información en agujeros negros, sintetizando desarrollos recientes en teoría holográfica, islas de entropía y la propuesta de página curve restaurada, evaluando su compatibilidad con la mecánica cuántica unitaria.",
    image: "https://images.unsplash.com/photo-1759327847036-22d9bad214bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvbGUlMjBldmVudCUyMGhvcml6b24lMjBzcGFjZXxlbnwxfHx8fDE3NzcxNDQ0NDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Agujeros Negros", "Paradoja de la Información", "Holografía", "Gravedad Cuántica"],
    readTime: "18 Min de lectura",
    sections: [
      { title: "El Problema", content: "Hawking demostró en 1974 que los agujeros negros emiten radiación térmica y eventualmente se evaporan. Si esta radiación es puramente térmica, la información que cayó al agujero negro se destruye, violando la unitariedad de la mecánica cuántica." },
      { title: "Propuestas de Resolución", content: "Las aproximaciones más prometedoras incluyen la correspondencia AdS/CFT, las islas de entropía de von Neumann, y las réplicas de Euclidean path integral que restauran la curva de Page sin requerir nueva física fundamental." },
      { title: "Estado Actual", content: "El consenso emergente sugiere que la información se preserva, pero su extracción requiere correlaciones exponencialmente complejas en la radiación de Hawking, haciendo prácticamente imposible su decodificación." }
    ],
    quote: "\"Un agujero negro no destruye información — la codifica en el caos más intrincado del universo.\"",
    figureCaption: "Figura 1: Curva de Page para entropía de entrelazamiento mostrando el tiempo de Page en unidades de tiempo de Hawking.",
    figureImage: "https://images.unsplash.com/photo-1759327847036-22d9bad214bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvbGUlMjBldmVudCUyMGhvcml6b24lMjBzcGFjZXxlbnwxfHx8fDE3NzcxNDQ0NDR8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "16",
    slug: "epigenetica-envejecimiento-metilacion",
    title: "Epigenética del Envejecimiento: Marcadores de Metilación como Reloj Biológico",
    subtitle: "Epigenetics of Aging: Methylation Markers as a Biological Clock. Validation of GrimAge in Hispanic cohorts.",
    category: "Biología Molecular",
    categoryColor: "#3ecf8e",
    type: "INVESTIGACIÓN ORIGINAL",
    authors: [{ name: "Dra. Beatriz Fuentes", institution: "Instituto Nacional de Geriatría, México" }],
    date: "14 de Mar, 2025",
    doi: "10.1038/cienceduc.2025.0145",
    abstract: "Validamos el reloj epigenético GrimAge en una cohorte de 4,200 individuos latinoamericanos, identificando modificaciones culturales al modelo que mejoran la predicción de mortalidad en un 18% comparado con la versión original entrenada en poblaciones europeas.",
    image: "https://images.unsplash.com/photo-1695640650754-31e8b17f7f56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlcGlnZW5ldGljcyUyMGFnaW5nJTIwY2VsbCUyMGJpb2xvZ3l8ZW58MXx8fHwxNzc3MTQ0NDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Epigenética", "Envejecimiento", "Metilación del ADN", "Relojes Biológicos"],
    readTime: "13 Min de lectura",
    sections: [
      { title: "Biología del Envejecimiento Epigenético", content: "Los patrones de metilación del ADN cambian sistemáticamente con la edad cronológica, pero también con el ritmo de envejecimiento biológico, determinado por factores genéticos, ambientales y conductuales." },
      { title: "Cohorte Latinoamericana", content: "Reclutamos 4,200 participantes de México, Colombia y Argentina de 40 a 90 años. Se midieron 850,000 sitios CpG mediante arrays EPIC de Illumina." },
      { title: "Hallazgos", content: "La edad epigenética acelerada >5 años se asoció con riesgo aumentado de mortalidad por todas las causas (HR 2.3, IC95% 1.8–2.9). Los factores ambientales latinoamericanos específicos, como la exposición a biomasa y la dieta, explicaron el 23% de la varianza en aceleración epigenética." }
    ],
    quote: "\"La biología del envejecimiento escrita en el ADN puede leerse — y quizás reescribirse.\"",
    figureCaption: "Figura 1: Correlación entre edad cronológica y edad epigenética (GrimAge latinoamericano) por sexo y origen.",
    figureImage: "https://images.unsplash.com/photo-1695640650754-31e8b17f7f56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlcGlnZW5ldGljcyUyMGFnaW5nJTIwY2VsbCUyMGJpb2xvZ3l8ZW58MXx8fHwxNzc3MTQ0NDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "17",
    slug: "fotosintesis-artificial-hidrogeno-solar",
    title: "Optimización de la Fotosíntesis Artificial para Producción de Hidrógeno Solar",
    subtitle: "Artificial Photosynthesis Optimization for Solar Hydrogen Production. Beyond the 20% efficiency threshold.",
    category: "Química",
    categoryColor: "#e8c55e",
    type: "INVESTIGACIÓN ORIGINAL",
    authors: [{ name: "Dr. Andrés Molina", institution: "Departamento de Química Física, Universidad de Sevilla" }],
    date: "5 de Abr, 2025",
    doi: "10.1038/cienceduc.2025.0213",
    abstract: "Reportamos un fotocatalizador de heterounión Z-scheme basado en MXene-TiO2/g-C3N4 que alcanza una eficiencia de conversión solar a hidrógeno del 22.4%, superando por primera vez el umbral teórico del 20% necesario para viabilidad económica.",
    image: "https://images.unsplash.com/photo-1587908232286-f3e72327e423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b3N5bnRoZXNpcyUyMHBsYW50JTIwYmlvY2hlbWlzdHJ5JTIwZ3JlZW58ZW58MXx8fHwxNzc3MTQ0NDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Fotocatálisis", "Hidrógeno Verde", "Energía Solar", "MXenes"],
    readTime: "10 Min de lectura",
    sections: [
      { title: "El Imperativo del Hidrógeno Verde", content: "La transición energética requiere vectores de almacenamiento capaces de compensar la intermitencia de las renovables. El hidrógeno producido por fotocatálisis solar directa representa la ruta más elegante, pero la eficiencia ha permanecido obstinadamente por debajo del 10% en sistemas prácticos." },
      { title: "El Fotocatalizador Z-scheme", content: "El sistema heterounión Z-scheme mimetiza el aparato fotosintético natural: un fotosistema I análogo oxida el agua y un fotosistema II análogo reduce protones. La interfaz MXene actúa como mediador redox de transferencia de carga ultrarrápida." },
      { title: "Rendimiento y Estabilidad", content: "Eficiencia solar-hidrógeno (STH) = 22.4% bajo irradiación AM 1.5G. El catalizador mantuvo >95% de actividad tras 200 horas de operación continua, un récord de estabilidad para sistemas de este tipo." }
    ],
    quote: "\"La naturaleza inventó la fotosíntesis hace 3,500 millones de años. Ahora la copiamos, y la mejoramos.\"",
    figureCaption: "Figura 1: Diagrama de banda de energía del heterounión Z-scheme y tasa de evolución de hidrógeno vs. tiempo.",
    figureImage: "https://images.unsplash.com/photo-1587908232286-f3e72327e423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b3N5bnRoZXNpcyUyMHBsYW50JTIwYmlvY2hlbWlzdHJ5JTIwZ3JlZW58ZW58MXx8fHwxNzc3MTQ0NDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "18",
    slug: "ondas-gravitacionales-neutrones-ligo-virgo",
    title: "Detección de Ondas Gravitacionales de Estrellas de Neutrones: Análisis LIGO-Virgo-KAGRA",
    subtitle: "Gravitational Wave Detection from Neutron Star Mergers. Multi-messenger astronomy enters the precision era.",
    category: "Física",
    categoryColor: "#9b7fd4",
    type: "CARTA DE INVESTIGACIÓN",
    authors: [
      { name: "Dr. Marco Rinaldi", institution: "INFN Sezione di Pisa, Italy" },
      { name: "Dra. Ana Torres", institution: "Instituto de Física Corpuscular, Valencia" }
    ],
    date: "18 de Abr, 2025",
    doi: "10.1038/cienceduc.2025.0267",
    abstract: "Reportamos la detección de GW250418, evento de fusión de estrellas de neutrones a 340 Mpc, con contraparte electromagnética en rayos gamma detectada por Fermi-GBM, proporcionando la medición independiente más precisa de la constante de Hubble mediante sirenas estándar.",
    image: "https://images.unsplash.com/photo-1755455840466-85747052a634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmF2aXRhdGlvbmFsJTIwd2F2ZXMlMjBzaWduYWwlMjBkZXRlY3RvcnxlbnwxfHx8fDE3NzcxNDQ0NDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Ondas Gravitacionales", "Estrellas de Neutrones", "LIGO", "Astronomía Multi-mensajero"],
    readTime: "9 Min de lectura",
    sections: [
      { title: "La Era Multi-mensajero", content: "Desde GW170817, la astronomía de ondas gravitacionales con contraparte electromagnética ha abierto una nueva ventana para explorar la física de materia densa y cosmología de precisión." },
      { title: "GW250418", content: "El evento fue detectado con SNR=32.4 por la red LIGO-Virgo-KAGRA el 18 de abril de 2025. El kilonova asociado fue observado en bandas óptica, infrarroja y rayos X durante 18 días, permitiendo caracterizar la eyección de material rico en lantánidos." },
      { title: "Constante de Hubble", content: "La combinación de distancia luminosa de ondas gravitacionales (340±18 Mpc) y velocidad de recesión del huésped galáctico (H0=71.2±2.1 km/s/Mpc) reconcilia parcialmente la tensión de Hubble." }
    ],
    quote: "\"Cada fusión de estrellas de neutrones es una fábrica cósmica de oro — y una medición del universo.\"",
    figureCaption: "Figura 1: Forma de onda de GW250418 en LIGO Hanford y Virgo, con curvas de sensibilidad y parámetros estimados.",
    figureImage: "https://images.unsplash.com/photo-1755455840466-85747052a634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmF2aXRhdGlvbmFsJTIwd2F2ZXMlMjBzaWduYWwlMjBkZXRlY3RvcnxlbnwxfHx8fDE3NzcxNDQ0NDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "19",
    slug: "biodiversidad-servicios-ecosistemicos-amazonia",
    title: "Pérdida de Biodiversidad y Servicios Ecosistémicos en la Amazonia: Una Evaluación Integral",
    subtitle: "Biodiversity Loss and Ecosystem Services in Amazonia. Tipping points and critical thresholds in the world's largest rainforest.",
    category: "Biología",
    categoryColor: "#3ecf8e",
    type: "REVISIÓN SISTEMÁTICA",
    authors: [{ name: "Dra. Fernanda Costa", institution: "Instituto Nacional de Pesquisas da Amazônia, Brasil" }],
    date: "22 de Abr, 2025",
    doi: "10.1038/cienceduc.2025.0289",
    abstract: "Revisamos 1,240 estudios publicados entre 2000 y 2025 sobre biodiversidad amazónica, sintetizando evidencia sobre puntos de inflexión ecosistémicos y el riesgo de sabanización irreversible ante escenarios de deforestación superiores al 25% de cobertura original.",
    image: "https://images.unsplash.com/photo-1669409428586-e62ed1a3adc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9kaXZlcnNpdHklMjB0cm9waWNhbCUyMGVjb3N5c3RlbSUyMHJlc2VhcmNofGVufDF8fHx8MTc3NzE0NDQ0NXww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Biodiversidad", "Amazonia", "Deforestación", "Servicios Ecosistémicos"],
    readTime: "16 Min de lectura",
    sections: [
      { title: "La Amazonia en Números", content: "La cuenca amazónica alberga el 10% de todas las especies del planeta, regula el ciclo del agua de América del Sur y absorbe aproximadamente 2 Pg de CO2 anuales. En 2024, la deforestación acumulada alcanzó el 21% de la cobertura original." },
      { title: "Puntos de Inflexión", content: "La evidencia consolidada apunta a un umbral crítico de deforestación entre el 20-25%, superado el cual la reducción de evapotranspiración genera retroalimentaciones positivas que pueden secar irreversiblemente la región oriental." },
      { title: "Valoración de Servicios", content: "Los servicios ecosistémicos amazónicos tienen un valor económico estimado en 2.4 billones de USD anuales, de los cuales solo el 8% está actualmente capturado por mecanismos de mercado o políticas de conservación." }
    ],
    quote: "\"La Amazonia no es solo el pulmón del planeta — es su corazón hidrológico.\"",
    figureCaption: "Figura 1: Mapa de deforestación acumulada y zonas de riesgo de transición sabana 2000–2025.",
    figureImage: "https://images.unsplash.com/photo-1669409428586-e62ed1a3adc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9kaXZlcnNpdHklMjB0cm9waWNhbCUyMGVjb3N5c3RlbSUyMHJlc2VhcmNofGVufDF8fHx8MTc3NzE0NDQ0NXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "20",
    slug: "estimulacion-transcraneal-mejora-cognitiva",
    title: "Mejora Cognitiva No-Invasiva mediante Estimulación Transcraneal en Adultos Mayores",
    subtitle: "Non-Invasive Cognitive Enhancement via Transcranial Stimulation in Older Adults. A double-blind randomized controlled trial.",
    category: "Neurociencia",
    categoryColor: "#3ecf8e",
    type: "ENSAYO CLÍNICO ALEATORIZADO",
    authors: [{ name: "Dr. Felipe Guzmán", institution: "Laboratorio de Neurociencia Cognitiva, PUC Chile" }],
    date: "24 de Abr, 2025",
    doi: "10.1038/cienceduc.2025.0301",
    abstract: "En un ensayo doble ciego de 180 participantes de 65-85 años, la estimulación transcraneal de corriente alterna gamma (tACS) a 40 Hz sobre la corteza prefrontal dorsolateral redujo el déficit en memoria de trabajo en un 31% respecto a placebo, sin efectos adversos significativos.",
    image: "https://images.unsplash.com/photo-1743767588082-e754fc9874be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyb3NjaWVuY2UlMjBicmFpbiUyMGNvZ25pdGl2ZSUyMGVuaGFuY2VtZW50fGVufDF8fHx8MTc3NzE0NDQ0NXww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["tACS", "Estimulación Cerebral", "Deterioro Cognitivo", "Neurotecnología"],
    readTime: "12 Min de lectura",
    stat: "31%",
    statLabel: "MEJORA EN MEMORIA DE TRABAJO vs. PLACEBO",
    sections: [
      { title: "El Reto del Envejecimiento Cognitivo", content: "El deterioro cognitivo asociado al envejecimiento afecta a 55 millones de personas mundialmente y carece de tratamientos farmacológicos modificadores de la enfermedad con efectividad robusta." },
      { title: "Protocolo tACS Gamma", content: "Los participantes recibieron 20 sesiones de 20 minutos de tACS a 40 Hz (oscilaciones gamma) sobre F3-F4 bilateral. El grupo control recibió estimulación sham indistinguible subjetivamente." },
      { title: "Resultados y Seguimiento", content: "La mejora en tareas de n-back se mantuvo a los 3 meses de seguimiento (25% de mejora residual). EEG de alta densidad confirmó sincronización gamma prefrontal aumentada correlacionada con la mejora conductual." }
    ],
    quote: "\"El cerebro envejecido no es un cerebro deteriorado — es un cerebro que necesita un empujón en la frecuencia correcta.\"",
    figureCaption: "Figura 1: Desempeño en tarea 2-back y 3-back pre/post intervención en grupo tACS vs. sham.",
    figureImage: "https://images.unsplash.com/photo-1743767588082-e754fc9874be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyb3NjaWVuY2UlMjBicmFpbiUyMGNvZ25pdGl2ZSUyMGVuaGFuY2VtZW50fGVufDF8fHx8MTc3NzE0NDQ0NXww&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export const categories = [
  { id: "all", label: "Todos", color: "#888" },
  { id: "biologia", label: "Biología", color: "#3ecf8e" },
  { id: "fisica", label: "Física", color: "#9b7fd4" },
  { id: "quimica", label: "Química", color: "#e8c55e" },
  { id: "astrofisica", label: "Astrofísica", color: "#6c8ebf" },
  { id: "metodologia", label: "Metodología", color: "#e07b54" },
];

export const editorialSuggestions = [
  { id: "e1", type: "quote", quote: "\"La pedagogía moderna no puede sostenerse sobre la mera intuición; exige validación.\"", label: "EDITORIAL" },
  { id: "e2", type: "image-overlay", articleId: "5", label: "INVESTIGACIÓN ORIGINAL" },
  { id: "e3", type: "stat", stat: "84%", statLabel: "CORRELACIÓN EMPÍRICA CON NIVEL SOCIOECONÓMICO" },
  { id: "e4", type: "text-card", articleId: "7", label: "METODOLOGÍA" },
  { id: "e5", type: "image-overlay", articleId: "6", label: "ENSAYO CRÍTICO" }
];
