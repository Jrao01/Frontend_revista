import { createContext, useContext, useState, ReactNode } from "react";
import {
  type Manuscript,
  type ManuscriptStatus,
  type ManuscriptComment,
  getInitialManuscripts,
} from "../data/manuscripts";

interface ManuscriptContextType {
  manuscripts: Manuscript[];
  updateStatus: (id: string, status: ManuscriptStatus, actor: string, actorRole: string, note?: string) => void;
  addComment: (id: string, comment: Omit<ManuscriptComment, "id">) => void;
  assignEditor: (id: string, editorEmail: string, editorName: string) => void;
  assignJurado: (id: string, email: string, name: string) => void;
  removeJurado: (id: string, email: string) => void;
  getManuscript: (id: string) => Manuscript | undefined;
  getByEmail: (email: string) => Manuscript[];
  getByStatus: (status: ManuscriptStatus) => Manuscript[];
  getAssignedToJurado: (email: string) => Manuscript[];
  submitJuradoReview: (manuscriptId: string, juradoEmail: string) => void;
}

const ManuscriptContext = createContext<ManuscriptContextType>({} as ManuscriptContextType);

export function ManuscriptProvider({ children }: { children: ReactNode }) {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>(getInitialManuscripts);

  const updateStatus = (
    id: string,
    status: ManuscriptStatus,
    actor: string,
    actorRole: string,
    note?: string
  ) => {
    setManuscripts((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const entry = {
          status,
          date: new Date().toISOString().split("T")[0],
          actor,
          actorRole,
          note,
        };
        return {
          ...m,
          status,
          timeline: [...m.timeline, entry],
        };
      })
    );
  };

  const addComment = (id: string, comment: Omit<ManuscriptComment, "id">) => {
    setManuscripts((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          comments: [
            ...m.comments,
            { ...comment, id: `c-${Date.now()}` },
          ],
        };
      })
    );
  };

  const assignEditor = (id: string, editorEmail: string, editorName: string) => {
    setManuscripts((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, assignedEditorEmail: editorEmail, assignedEditorName: editorName }
          : m
      )
    );
  };

  const assignJurado = (id: string, email: string, name: string) => {
    setManuscripts((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (m.assignedJurados.find((j) => j.email === email)) return m;
        return {
          ...m,
          assignedJurados: [...m.assignedJurados, { email, name, submitted: false }],
        };
      })
    );
  };

  const removeJurado = (id: string, email: string) => {
    setManuscripts((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, assignedJurados: m.assignedJurados.filter((j) => j.email !== email) }
          : m
      )
    );
  };

  const submitJuradoReview = (manuscriptId: string, juradoEmail: string) => {
    setManuscripts((prev) =>
      prev.map((m) => {
        if (m.id !== manuscriptId) return m;
        return {
          ...m,
          assignedJurados: m.assignedJurados.map((j) =>
            j.email === juradoEmail ? { ...j, submitted: true } : j
          ),
        };
      })
    );
  };

  const getManuscript = (id: string) => manuscripts.find((m) => m.id === id);
  const getByEmail = (email: string) => manuscripts.filter((m) => m.submittedByEmail === email);
  const getByStatus = (status: ManuscriptStatus) => manuscripts.filter((m) => m.status === status);
  const getAssignedToJurado = (email: string) =>
    manuscripts.filter((m) => m.assignedJurados.some((j) => j.email === email));

  return (
    <ManuscriptContext.Provider
      value={{
        manuscripts,
        updateStatus,
        addComment,
        assignEditor,
        assignJurado,
        removeJurado,
        getManuscript,
        getByEmail,
        getByStatus,
        getAssignedToJurado,
        submitJuradoReview,
      }}
    >
      {children}
    </ManuscriptContext.Provider>
  );
}

export const useManuscripts = () => useContext(ManuscriptContext);
