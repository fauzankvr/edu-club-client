import React, { useState } from "react";

// Define the types for the notes based on your schema
interface INote {
  _id: string;
  Title: string;
  Nots: string[];
  Student_id?: string | null;
  Course_id?: string | null;
}

// Modal component for adding a new notebook
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Add Note Book
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Please enter your note book name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-indigo-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Notes Component
const NotesApp: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notebooks, setNotebooks] = useState<INote[]>([
    {
      _id: "1",
      Title: "Webdesing Not Book",
      Nots: ["When use the css it the important"],
      Student_id: null,
      Course_id: null,
    },
  ]);
  const [newNote, setNewNote] = useState("");

  const addNotebook = (title: string) => {
    const newNotebook: INote = {
      _id: Date.now().toString(), // Temporary ID for demo
      Title: title,
      Nots: [],
      Student_id: null,
      Course_id: null,
    };
    setNotebooks([...notebooks, newNotebook]);
  };

  const addNoteToNotebook = (notebookId: string) => {
    if (!newNote.trim()) return;

    setNotebooks(
      notebooks.map((notebook) =>
        notebook._id === notebookId
          ? { ...notebook, Nots: [...notebook.Nots, newNote] }
          : notebook
      )
    );
    setNewNote("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Add Note Book Button */}
      <div className="flex justify-between items-center bg-gray-200 p-4 rounded-md mb-6">
        <h1 className="text-xl font-semibold text-indigo-800">Add Note Book</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-2xl text-indigo-600 hover:text-indigo-800"
        >
          +
        </button>
      </div>

      {/* Modal for Adding Notebook */}
      <AddNotebookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addNotebook}
      />

      {/* Notebooks List */}
      <div className="space-y-6">
        {notebooks.map((notebook) => (
          <div
            key={notebook._id}
            className="bg-gray-200 p-6 rounded-md shadow-md"
          >
            <h2 className="text-lg font-semibold text-indigo-700 mb-4">
              {notebook.Title}
            </h2>
            <ul className="space-y-2 mb-4">
              {notebook.Nots.map((note, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-indigo-600">▶</span>
                  <span className="text-gray-800">{note}</span>
                </li>
              ))}
            </ul>
            <textarea
              placeholder="Write note hear ....."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-2 border border-indigo-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end">
              <button
                onClick={() => addNoteToNotebook(notebook._id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
