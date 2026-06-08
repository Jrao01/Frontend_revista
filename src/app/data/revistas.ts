export interface Volume {
  id: string;
  volumeNumber: number;
  issueNumber: number;
  publicationDate: string;
  pdfUrl: string;
  articleIds: string[]; // references to articles in articles.ts
}

export interface Revista {
  id: string;
  name: string;
  description: string;
  periodicity: string;
  issn: string;
  coverImage: string;
  volumes: Volume[];
}

export const revistas: Revista[] = [
  {
    id: "cienciaeduc",
    name: "SaberUnerg",
    description: "Nuestra revista insignia dedicada a la investigación empírica rigurosa, el pensamiento crítico y la difusión del conocimiento en biología, física, química y educación.",
    periodicity: "Semestral",
    issn: "2443-4256",
    coverImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    volumes: [
      {
        id: "v14-i4",
        volumeNumber: 14,
        issueNumber: 4,
        publicationDate: "Diciembre 2024",
        pdfUrl: "/documents/cienciaeduc_v14_i4.pdf",
        articleIds: ["11", "13", "12"]
      },
      {
        id: "v14-i3",
        volumeNumber: 14,
        issueNumber: 3,
        publicationDate: "Noviembre 2024",
        pdfUrl: "/documents/cienciaeduc_v14_i3.pdf",
        articleIds: ["2", "4", "6"]
      },
      {
        id: "v14-i2",
        volumeNumber: 14,
        issueNumber: 2,
        publicationDate: "Octubre 2024",
        pdfUrl: "/documents/cienciaeduc_v14_i2.pdf",
        articleIds: ["1", "8", "3"]
      },
      {
        id: "v14-i1",
        volumeNumber: 14,
        issueNumber: 1,
        publicationDate: "Junio 2024",
        pdfUrl: "/documents/cienciaeduc_v14_i1.pdf",
        articleIds: ["10", "15"]
      }
    ]
  },
  {
    id: "rev-unerg-salud",
    name: "Revista UNERG Salud",
    description: "Publicación oficial de la Universidad Nacional Experimental Rómulo Gallegos dedicada a la investigación clínica, la salud pública, la medicina preventiva y la enfermería comunitaria.",
    periodicity: "Trimestral",
    issn: "1856-9874",
    coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    volumes: [
      {
        id: "v8-i2",
        volumeNumber: 8,
        issueNumber: 2,
        publicationDate: "Enero 2025",
        pdfUrl: "/documents/unerg_salud_v8_i2.pdf",
        articleIds: ["14", "20"]
      },
      {
        id: "v8-i1",
        volumeNumber: 8,
        issueNumber: 1,
        publicationDate: "Octubre 2024",
        pdfUrl: "/documents/unerg_salud_v8_i1.pdf",
        articleIds: ["9", "16"]
      }
    ]
  },
  {
    id: "ensayos-academicos",
    name: "Ensayos Académicos",
    description: "Un foro de debate intelectual y análisis metodológico para investigaciones multidisciplinarias en educación, pedagogía moderna y ciencias metodológicas aplicadas.",
    periodicity: "Anual",
    issn: "2665-0125",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    volumes: [
      {
        id: "v5-i1",
        volumeNumber: 5,
        issueNumber: 1,
        publicationDate: "Diciembre 2024",
        pdfUrl: "/documents/ensayos_academicos_v5_i1.pdf",
        articleIds: ["5", "7", "17", "18", "19"]
      }
    ]
  }
];
