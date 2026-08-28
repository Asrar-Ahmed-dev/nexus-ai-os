"use client";

import { useEffect, useState } from "react";
import { Pin, Plus, Search, Trash2, Edit3, Save, X } from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import AuthGuard from "../../components/auth/AuthGuard";
import { apiFetch } from "../../lib/api";

type Note = {
  id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================
  // Load Notes
  // ==========================

  async function loadNotes() {
    try {
      setLoading(true);
      const data = await apiFetch<Note[]>("/notes/");

      setNotes(data);

      if (data.length > 0 && !selectedNote) {
        setSelectedNote(data[0]);
        setTitle(data[0].title);
        setContent(data[0].content);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  // ==========================
  // Select Note
  // ==========================

  function selectNote(note: Note) {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }

  // ==========================
  // Create Note
  // ==========================

  async function createNote() {
    try {
      setSaving(true);

      const newNote = await apiFetch<Note>("/notes/", {
        method: "POST",
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
        }),
      });


      setNotes((prev) => [newNote, ...prev]);

      setSelectedNote(newNote);
      setTitle(newNote.title);
      setContent(newNote.content);
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setSaving(false);
    }
  }

  // ==========================
  // Save Note
  // ==========================

  async function saveNote() {
    if (!selectedNote) return;

    try {
      setSaving(true);

      const updatedNote = await apiFetch<Note>(
        `/notes/${selectedNote.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      setNotes((prev) =>
        prev.map((note) =>
          note.id === updatedNote.id
            ? updatedNote
            : note
        )
      );

      setSelectedNote(updatedNote);
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setSaving(false);
    }
  }

  // ==========================
  // Delete Note
  // ==========================

  async function deleteNote() {
    if (!selectedNote) return;

    const confirmed = window.confirm(
      "Delete this note?"
    );

    if (!confirmed) return;

    try {
      await apiFetch(
        `/notes/${selectedNote.id}`,
        {
          method: "DELETE",
        }
      );

      const remaining = notes.filter(
        (note) => note.id !== selectedNote.id
      );

      setNotes(remaining);

      if (remaining.length > 0) {
        selectNote(remaining[0]);
      } else {
        setSelectedNote(null);
        setTitle("");
        setContent("");
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }

  // ==========================
  // Pin Note
  // ==========================

  async function togglePin() {
    if (!selectedNote) return;

    try {
      const result = await apiFetch<Note>(
        `/notes/${selectedNote.id}/pin`,
        {
          method: "PUT",
        }
      );



      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNote.id
            ? {
                ...note,
                is_pinned: result.is_pinned,
              }
            : note
        )
      );

      setSelectedNote((prev) =>
        prev
          ? {
              ...prev,
              is_pinned: result.is_pinned,
            }
          : null
      );
    } catch (error) {
      console.error("Failed to pin note:", error);
    }
  }

  // ==========================
  // Search
  // ==========================

  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase();

    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <AuthGuard>
      <main className="h-screen flex bg-[#0E0E13] text-white overflow-hidden">

        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">

          <Topbar />

          <div className="flex flex-1 overflow-hidden">

            {/* ==========================
                Notes List
            ========================== */}

            <aside className="w-80 border-r border-zinc-800 flex flex-col">

              <div className="p-5 border-b border-zinc-800">

                <button
                  onClick={createNote}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-3 font-medium transition"
                >
                  <Plus size={20} />

                  New Note
                </button>

                <div className="mt-4 relative">

                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-zinc-500"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search notes..."
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 outline-none focus:border-purple-500"
                  />

                </div>

              </div>

              <div className="flex-1 overflow-y-auto p-3">

                {loading && (
                  <p className="text-zinc-500 text-center py-8">
                    Loading notes...
                  </p>
                )}

                {!loading &&
                  filteredNotes.length === 0 && (
                    <div className="text-center py-10">

                      <p className="text-zinc-500">
                        No notes yet
                      </p>

                      <p className="text-zinc-600 text-sm mt-2">
                        Create your first note.
                      </p>

                    </div>
                  )}

                <div className="space-y-2">

                  {filteredNotes.map((note) => (

                    <button
                      key={note.id}
                      onClick={() =>
                        selectNote(note)
                      }
                      className={`w-full text-left rounded-xl p-4 transition ${
                        selectedNote?.id === note.id
                          ? "bg-purple-600/20 border border-purple-500/40"
                          : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <h3 className="font-medium truncate">
                          {note.title}
                        </h3>

                        {note.is_pinned && (
                          <Pin
                            size={15}
                            className="text-yellow-400 shrink-0"
                          />
                        )}

                      </div>

                      <p className="text-zinc-500 text-sm mt-2 line-clamp-2">
                        {note.content ||
                          "Empty note"}
                      </p>

                    </button>

                  ))}

                </div>

              </div>

            </aside>

            {/* ==========================
                Editor
            ========================== */}

            <section className="flex-1 flex flex-col overflow-hidden">

              {!selectedNote ? (

                <div className="flex-1 flex items-center justify-center">

                  <div className="text-center">

                    <Edit3
                      size={40}
                      className="mx-auto text-zinc-600"
                    />

                    <h2 className="text-xl font-semibold mt-4">
                      No note selected
                    </h2>

                    <p className="text-zinc-500 mt-2">
                      Create a note to get started.
                    </p>

                  </div>

                </div>

              ) : (

                <>
                  {/* Editor toolbar */}

                  <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <button
                        onClick={togglePin}
                        className={`p-2 rounded-lg transition ${
                          selectedNote.is_pinned
                            ? "bg-yellow-400/10 text-yellow-400"
                            : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                        }`}
                        title="Pin note"
                      >
                        <Pin size={20} />
                      </button>

                      <span className="text-sm text-zinc-500">
                        {selectedNote.is_pinned
                          ? "Pinned"
                          : "Not pinned"}
                      </span>

                    </div>

                    <div className="flex items-center gap-2">

                      <button
                        onClick={deleteNote}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                        title="Delete note"
                      >
                        <Trash2 size={20} />
                      </button>

                      <button
                        onClick={saveNote}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 transition disabled:opacity-50"
                      >

                        <Save size={18} />

                        {saving
                          ? "Saving..."
                          : "Save"}

                      </button>

                    </div>

                  </div>

                  {/* Title */}

                  <div className="px-10 pt-8">

                    <input
                      value={title}
                      onChange={(e) =>
                        setTitle(e.target.value)
                      }
                      className="w-full bg-transparent text-4xl font-bold outline-none placeholder:text-zinc-700"
                      placeholder="Note title"
                    />

                  </div>

                  {/* Content */}

                  <div className="flex-1 px-10 py-6 overflow-y-auto">

                    <textarea
                      value={content}
                      onChange={(e) =>
                        setContent(e.target.value)
                      }
                      placeholder="Start writing..."
                      className="w-full h-full min-h-[400px] resize-none bg-transparent outline-none text-lg leading-8 text-zinc-300 placeholder:text-zinc-700"
                    />

                  </div>

                </>

              )}

            </section>

          </div>

        </div>

      </main>
    </AuthGuard>
  );
}