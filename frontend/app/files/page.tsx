"use client";

import { useEffect, useState } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

import {
  uploadFile,
  getFiles,
  deleteFile,
} from "../../services/api";


type UploadedFile = {
  id: number;
  filename: string;
  file_type: string;
  created_at?: string;
};


export default function FilesPage() {

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleDelete(fileId: number) {
    try {
      setError("");

      await deleteFile(fileId);

      setFiles((prev) =>
        prev.filter((file) => file.id !== fileId)
      );

    } catch (err) {
      console.error(err);
      setError("Failed to delete file.");
    }
  }


  // ==========================
  // Load Files
  // ==========================

  useEffect(() => {

    async function loadFiles() {

      try {

        setLoading(true);
        setError("");

        const data = await getFiles();

        setFiles(data);

      } catch (err) {

        console.error(err);

        setError("Failed to load files.");

      } finally {

        setLoading(false);

      }
    }

    loadFiles();

  }, []);


  // ==========================
  // Upload File
  // ==========================

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setUploading(true);

    try {

      const result = await uploadFile(file);

      const newFile: UploadedFile = {
        id: result.id,
        filename: result.filename,
        file_type: result.file_type,
      };

      setFiles((prev) => [
        newFile,
        ...prev,
      ]);

    } catch (err) {

      console.error(err);

      setError("Failed to upload file.");

    } finally {

      setUploading(false);

      event.target.value = "";

    }
  }


  return (
    <main className="h-screen flex bg-[#0E0E13] text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">

        <Topbar />

        <div className="flex-1 overflow-y-auto p-10">

          <div className="mx-auto max-w-6xl">


            {/* ==========================
                Header
            ========================== */}

            <div className="flex items-center justify-between">

              <div>

                <p className="uppercase tracking-[0.3em] text-cyan-400 text-sm font-semibold">
                  — FILE SYSTEM
                </p>

                <h1 className="mt-3 text-5xl font-bold">
                  Files
                </h1>

                <p className="mt-3 text-zinc-400 text-lg">
                  Upload and manage files that Nexus can understand.
                </p>

              </div>


              {/* Upload */}

              <label
                htmlFor="file-upload"
                className="
                  cursor-pointer
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  px-6
                  py-3
                  font-medium
                  transition
                  hover:scale-105
                  hover:shadow-lg
                  hover:shadow-cyan-500/20
                "
              >

                {uploading
                  ? "Uploading..."
                  : "+ Upload File"}

              </label>


              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.txt,.docx"
                onChange={handleUpload}
                disabled={uploading}
              />

            </div>


            {/* ==========================
                Error
            ========================== */}

            {error && (

              <div className="
                mt-6
                rounded-xl
                border
                border-red-500/30
                bg-red-500/10
                px-5
                py-4
                text-red-400
              ">

                {error}

              </div>

            )}


            {/* ==========================
                Loading
            ========================== */}

            {loading && (

              <div className="
                mt-10
                rounded-3xl
                border
                border-white/10
                bg-[#111118]
                p-16
                text-center
              ">

                <div className="text-4xl">
                  ⏳
                </div>

                <p className="mt-4 text-zinc-400">
                  Loading your files...
                </p>

              </div>

            )}


            {/* ==========================
                Empty State
            ========================== */}

            {!loading &&
              files.length === 0 && (
                <div className="
                  mt-10
                  rounded-3xl
                  border
                  border-white/10
                  bg-[#111118]
                  p-16
                  text-center
                ">

                  <div className="text-5xl">
                    📁
                  </div>

                  <h2 className="mt-6 text-2xl font-semibold">
                    No files yet
                  </h2>

                  <p className="mt-3 text-zinc-500">
                    Upload a PDF, TXT, or DOCX file to get started.
                  </p>

                </div>
              )}


            {/* ==========================
                Files
            ========================== */}

            {!loading &&
              files.length > 0 && (

                <div className="mt-10 grid gap-4">

                  {files.map((file) => (
                      <div
                        key={file.id}
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-2xl
                          border
                          border-white/10
                          bg-[#111118]
                          px-6
                          py-5
                          transition
                          hover:border-cyan-500/40
                        "
                      >

                       {/* File information */}

                      <div className="flex items-center gap-4">

                        <div
                          className="
                           flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-white/10
                            text-2xl
                          "
                        >
                         📄
                        </div>

                        <div>

                         <p className="font-medium text-white">
                           {file.filename}
                         </p>

                         <p className="mt-1 text-sm text-zinc-500">
                           Available to Nexus
                         </p>

                        </div>

                      </div>


                      {/* File actions */}

                        <div className="flex items-center gap-3">

                        <span
                         className="
                          rounded-lg
                          bg-green-500/10
                          px-3
                          py-1
                          text-sm
                          text-green-400
                        "
                      >
                        Uploaded
                      </span>

                      <button
                        onClick={() => handleDelete(file.id)}
                        className="
                          rounded-lg
                          bg-red-500/10
                          px-3
                          py-1
                          text-sm
                          text-red-400
                          transition
                          hover:bg-red-500/20
                          hover:text-red-300
                        "
                      >
                        Delete
                      </button>

                    </div>

                    </div>
                  ))}

                </div>

              )}

          </div>

        </div>

      </div>

    </main>
  );
}