"use client";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import AuthGuard from "../../components/auth/AuthGuard";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  Check,
  Clock,
  Plus,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

import {
  createTask,
  deleteTask,
  getTasks,
  PlannerTask,
  updateTask,
} from "../../services/api";


type Task = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
};


function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function isOverdue(task: Task) {
  if (task.completed) return false;

  const due = new Date(
    `${task.date}T${task.time || "23:59"}:00`
  );

  return due < new Date();
}


export default function PlannerPage() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);


  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [saving, setSaving] = useState(false);


  // ==========================
  // Load tasks from backend
  // ==========================

  useEffect(() => {

    async function loadTasks() {

      try {

        setLoading(true);

        const data: PlannerTask[] = await getTasks();

        const formattedTasks: Task[] = data.map((task) => {

          const dueDate = new Date(task.due_date);

          return {
            id: task.id,
            title: task.title,
            description: task.description || "",
            date: dueDate.toISOString().split("T")[0],
            time: dueDate.toTimeString().slice(0, 5),
            completed: Boolean(task.completed),
          };

        });

        setTasks(formattedTasks);

      } catch (error) {

        console.error("Failed to load tasks:", error);

      } finally {

        setLoading(false);

      }

    }

    loadTasks();

  }, []);


  // ==========================
  // Add task
  // ==========================

  async function addTask() {

    if (!title.trim() || !date) {
      return;
    }

    try {

      setSaving(true);

      const dueDate = `${date}T${time || "23:59"}:00`;

      const created = await createTask(
        title.trim(),
        description.trim(),
        dueDate
      );

      const newTask: Task = {
        id: created.id,
        title: created.title,
        description: created.description || "",
        date,
        time: time || "23:59",
        completed: Boolean(created.completed),
      };

      setTasks((current) => [
        ...current,
        newTask,
      ]);

      setTitle("");
      setDescription("");
      setDate("");
      setTime("");

      setShowForm(false);

    } catch (error) {

      console.error("Failed to create task:", error);
      alert("Failed to create task.");

    } finally {

      setSaving(false);

    }

  }
  async function saveTaskChanges() {
    if (
      editingTaskId === null ||
      !title.trim() ||
      !date
    ) {
      return;
    }

    try {
      setSaving(true);

      const dueDate = `${date}T${time || "23:59"}:00`;

      const updated = await updateTask(
        editingTaskId,
        {
          title: title.trim(),
          description: description.trim(),
          due_date: dueDate,
        }
      );

      setTasks((current) =>
        current.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: updated.title,
                description: updated.description || "",
                date,
                time: time || "23:59",
              }
            : task
        )
      );

      setEditingTaskId(null);

      setTitle("");
      setDescription("");
      setDate("");
      setTime("");

      setShowForm(false);

    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task.");
    } finally {
      setSaving(false);
    }
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id);

    setTitle(task.title);
    setDescription(task.description);
    setDate(task.date);
    setTime(task.time);

    setShowForm(true);
  }


  // ==========================
  // Complete / uncomplete
  // ==========================

  async function toggleTask(task: Task) {

    try {

      const updated = await updateTask(
        task.id,
        {
          completed: !task.completed,
        }
      );

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? {
                ...item,
                completed: Boolean(updated.completed),
              }
            : item
        )
      );

    } catch (error) {

      console.error("Failed to update task:", error);
      alert("Failed to update task.");

    }

  }


  // ==========================
  // Delete task
  // ==========================

  async function removeTask(id: number) {

    try {

      await deleteTask(id);

      setTasks((current) =>
        current.filter((task) => task.id !== id)
      );

    } catch (error) {

      console.error("Failed to delete task:", error);
      alert("Failed to delete task.");

    }

  }


  const pendingTasks = tasks.filter(
    (task) => !task.completed
  );

  const completedTasks = tasks.filter(
    (task) => task.completed
  );


  // ==========================
  // Loading
  // ==========================

  if (loading) {

    return (
      <main className="min-h-screen bg-[#0E0E13] text-white px-10 py-10">

        <p className="uppercase tracking-[0.35em] text-cyan-400 text-sm font-semibold">
          — PLANNER
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          Plan your day.
        </h1>

        <p className="mt-6 text-zinc-500">
          Loading your tasks...
        </p>

      </main>
    );

  }


  return (
    <AuthGuard>
      <main className="min-h-screen flex bg-[#0E0E13] text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar/>
          <div className="flex-1 overflow-y-auto px-10 py-10">
        


      {/* Header */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <p className="uppercase tracking-[0.35em] text-cyan-400 text-sm font-semibold">
            — PLANNER
          </p>

          <h1 className="mt-4 text-5xl font-bold">
            Plan your day.
          </h1>

          <p className="mt-3 text-zinc-400 text-lg">
            Organize your tasks, deadlines and priorities.
          </p>

        </div>


        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold transition hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
        >

          <Plus size={20} />

          Add Task

        </button>

      </div>


      {/* Stats */}

      <div className="grid grid-cols-3 gap-5 mb-8">

        <div className="rounded-2xl border border-white/10 bg-[#18181F] p-6">

          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Total Tasks
          </p>

          <p className="mt-3 text-4xl font-bold text-cyan-400">
            {tasks.length}
          </p>

        </div>


        <div className="rounded-2xl border border-white/10 bg-[#18181F] p-6">

          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Pending
          </p>

          <p className="mt-3 text-4xl font-bold text-purple-400">
            {pendingTasks.length}
          </p>

        </div>


        <div className="rounded-2xl border border-white/10 bg-[#18181F] p-6">

          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Completed
          </p>

          <p className="mt-3 text-4xl font-bold text-green-400">
            {completedTasks.length}
          </p>

        </div>

      </div>


      {/* Add Task Form */}

      {showForm && (

        <div className="mb-8 rounded-3xl border border-white/10 bg-[#18181F] p-7">

          <h2 className="text-2xl font-semibold mb-6">
            {editingTaskId === null
              ? "Create a new task"
              : "Edit task"}
          </h2>


          <div className="grid grid-cols-2 gap-5">

            <div className="col-span-2">

              <label className="text-sm text-zinc-400">
                Task title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Study Operating Systems"
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#101017] px-4 py-3 text-white outline-none focus:border-cyan-500"
              />

            </div>


            <div className="col-span-2">

              <label className="text-sm text-zinc-400">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Add some details..."
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#101017] px-4 py-3 text-white outline-none focus:border-cyan-500"
              />

            </div>


            <div>

              <label className="text-sm text-zinc-400">
                Due date
              </label>

              <div className="relative mt-2">

                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#101017] px-12 py-3 text-white outline-none focus:border-cyan-500"
                />

              </div>

            </div>


            <div>

              <label className="text-sm text-zinc-400">
                Time
              </label>

              <div className="relative mt-2">

                <Clock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  type="time"
                  value={time}
                  onChange={(e) =>
                    setTime(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#101017] px-12 py-3 text-white outline-none focus:border-cyan-500"
                />

              </div>

            </div>

          </div>


          <div className="flex justify-end gap-3 mt-6">

            <button
              onClick={() => {
                setShowForm(false);
                setEditingTaskId(null);
                setTitle("");
                setDescription("");
                setDate("");
                setTime("");
              }}

              className="rounded-xl border border-white/10 px-5 py-3 text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>


            <button
              onClick={
                editingTaskId === null
                  ? addTask
                  : saveTaskChanges
              }
              disabled={!title.trim() || !date || saving}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >

              {saving 
                ? editingTaskId === null
                  ?"Creating..."
                  :"Saving..."
                : editingTaskId === null
                  ?"Creating Task"
                  :"Save Changes"}

            </button>

          </div>

        </div>

      )}


      {/* Tasks */}

      <div className="space-y-5">

        <h2 className="text-2xl font-semibold">
          Your Tasks
        </h2>


        {tasks.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-white/10 bg-[#18181F] p-12 text-center">

            <CalendarDays
              size={40}
              className="mx-auto text-zinc-600"
            />

            <p className="mt-4 text-zinc-400">
              No tasks yet.
            </p>

            <p className="mt-1 text-sm text-zinc-600">
              Click "Add Task" to create your first task.
            </p>

          </div>

        ) : (

          tasks.map((task) => (

            <div
              key={task.id}
              className={`flex items-center gap-5 rounded-2xl border border-white/10 bg-[#18181F] p-5 transition ${
                task.completed
                  ? "opacity-60"
                  : "hover:border-cyan-500/30"
              }`}
            >

              {/* Complete */}

              <button
                onClick={() => toggleTask(task)}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                  task.completed
                    ? "border-green-500 bg-green-500 text-black"
                    : "border-zinc-700 text-transparent hover:border-cyan-400"
                }`}
              >

                <Check size={20} />

              </button>


              {/* Information */}

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-3">

                  <h3
                    className={`text-lg font-semibold ${
                      task.completed
                        ? "text-zinc-500 line-through"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </h3>

                  {isOverdue(task) && (
                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                      OVERDUE
                    </span>
                  )}

                </div>


                {task.description && (

                  <p className="mt-1 text-sm text-zinc-500">
                    {task.description}
                  </p>

                )}


                <div className="mt-3 flex items-center gap-5 text-sm text-zinc-500">

                  <span className="flex items-center gap-2">

                    <CalendarDays size={15} />

                    {formatDate(task.date)}

                  </span>


                  {task.time && (

                    <span className="flex items-center gap-2">

                      <Clock size={15} />

                      {task.time}

                    </span>

                  )}

                </div>

              </div>


              {/* Delete */}
            <button
              onClick={() => startEditingTask(task)}
              className="rounded-xl p-3 text-zinc-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
              title="Edit task"
            >
             <Pencil size={19} />
            </button>

              <button
                onClick={() => removeTask(task.id)}
                className="rounded-xl p-3 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                title="Delete task"
              >

                <Trash2 size={19} />

              </button>

            </div>

              ))

              )}

            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );

}