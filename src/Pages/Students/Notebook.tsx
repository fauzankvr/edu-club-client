import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import studentAPI from "@/API/StudentApi";
import { ICourseData } from "@/Interface/CourseData";

interface INote {
  _id: string;
  title: string;
  notes: string[];
  student_id?: string | null;
  course_id?: string | null;
}

const AddNotebookModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
}> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title);
      setTitle("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Add Notebook
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter notebook name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-indigo-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface NotesAppProps {
  course: ICourseData | undefined;
}

const NotesApp: React.FC<NotesAppProps> = ({ course }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notebooks, setNotebooks] = useState<INote[]>([]);
  const [noteInputs, setNoteInputs] = useState<{ [key: string]: string }>({});
  const [editingNote, setEditingNote] = useState<{
    notebookId: string;
    index: number;
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (course?._id) {
          const res = await studentAPI.getNotes(course._id);
          setNotebooks(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      }
    };

    fetchNotes();
  }, [course]);

  const addNotebook = async (title: string) => {
    try {
      if (course?._id) {
        const newNote = await studentAPI.createNote({
          title: title,
          course_id: course._id,
          notes: [],
        });
        setNotebooks((prev) => [...prev, newNote.data]);
      }
    } catch (err) {
      console.error("Failed to create notebook:", err);
    }
  };

  const deleteNotebook = async (notebookId: string) => {
    try {
      await studentAPI.deleteNotebook(notebookId);
      setNotebooks((prev) =>
        prev.filter((notebook) => notebook._id !== notebookId)
      );
      setNoteInputs((prev) => {
        const { [notebookId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error("Failed to delete notebook:", error);
    }
  };

  const addNoteToNotebook = async (notebookId: string) => {
    const note = noteInputs[notebookId];
    if (!note?.trim()) return;

    try {
      const res = await studentAPI.addNoteToNotebook(notebookId, note);
      const updatedNotebook = res.data;

      setNotebooks((prev) =>
        prev.map((notebook) =>
          notebook._id === notebookId ? updatedNotebook : notebook
        )
      );
      setNoteInputs((prev) => ({ ...prev, [notebookId]: "" }));
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const deleteNote = async (notebookId: string, noteIndex: number) => {
    try {
      const res = await studentAPI.deleteNoteFromNotebook(
        notebookId,
        noteIndex
      );
      const updatedNotebook = res.data;

      setNotebooks((prev) =>
        prev.map((notebook) =>
          notebook._id === notebookId ? updatedNotebook : notebook
        )
      );
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const editNote = async (
    notebookId: string,
    noteIndex: number,
    newText: string
  ) => {
    try {
      const res = await studentAPI.updateNoteInNotebook(
        notebookId,
        noteIndex,
        newText
      );
      const updatedNotebook = res.data;

      setNotebooks((prev) =>
        prev.map((notebook) =>
          notebook._id === notebookId ? updatedNotebook : notebook
        )
      );
      setEditingNote(null);
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const startEditingNote = (
    notebookId: string,
    index: number,
    text: string
  ) => {
    setEditingNote({ notebookId, index, text });
  };

  const handleEditSubmit = (
    e: React.FormEvent,
    notebookId: string,
    noteIndex: number
  ) => {
    e.preventDefault();
    if (editingNote && editingNote.text.trim()) {
      editNote(notebookId, noteIndex, editingNote.text);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center bg-gray-200 p-4 rounded-md mb-6">
        <h1 className="text-xl font-semibold text-indigo-800">My Notes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-indigo-600 hover:text-indigo-800 transition-colors"
          title="Add Notebook"
        >
          <Icon icon="mdi:plus-circle" width="24" height="24" />
        </button>
      </div>

      <AddNotebookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addNotebook}
      />

      <div className="space-y-6">
        {notebooks.map((notebook) => (
          <div
            key={notebook._id}
            className="bg-gray-200 p-6 rounded-md shadow-md relative"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-indigo-700">
                {notebook.title}
              </h2>
              <button
                onClick={() => deleteNotebook(notebook._id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Delete Notebook"
              >
                <Icon icon="mdi:delete" width="20" height="20" />
              </button>
            </div>
            <ul className="space-y-2 mb-4">
              {notebook.notes.map((note, index) => (
                <li key={index} className="flex items-center gap-2">
                  {editingNote?.notebookId === notebook._id &&
                  editingNote?.index === index ? (
                    <form
                      onSubmit={(e) => handleEditSubmit(e, notebook._id, index)}
                      className="flex w-full gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={editingNote.text}
                        onChange={(e) =>
                          setEditingNote((prev) =>
                            prev ? { ...prev, text: e.target.value } : prev
                          )
                        }
                        className="flex-grow p-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        title="Save Edit"
                      >
                        <Icon icon="mdi:content-save" width="16" height="16" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNote(null)}
                        className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                        title="Cancel Edit"
                      >
                        <Icon icon="mdi:close" width="16" height="16" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="text-indigo-600">
                        <Icon icon="mdi:chevron-right" width="16" height="16" />
                      </span>
                      <span className="text-gray-800 flex-grow">{note}</span>
                      <button
                        onClick={() =>
                          startEditingNote(notebook._id, index, note)
                        }
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit Note"
                      >
                        <Icon icon="mdi:pencil" width="16" height="16" />
                      </button>
                      <button
                        onClick={() => deleteNote(notebook._id, index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Note"
                      >
                        <Icon icon="mdi:delete" width="16" height="16" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <textarea
              placeholder="Write note here..."
              value={noteInputs[notebook._id] || ""}
              onChange={(e) =>
                setNoteInputs((prev) => ({
                  ...prev,
                  [notebook._id]: e.target.value,
                }))
              }
              className="w-full p-2 border border-indigo-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end">
              <button
                onClick={() => addNoteToNotebook(notebook._id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesApp;
