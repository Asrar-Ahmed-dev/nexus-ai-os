import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Welcome from "../components/dashboard/Welcome";
import StatusPanel from "../components/layout/StatusPanel";
import AuthGuard from "../components/auth/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <main className="min-h-screen flex bg-[#0E0E13] text-white overflow-hidden">

        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">

          <Topbar />

          <div className="flex flex-1 overflow-hidden">

            <section className="flex-1 overflow-hidden px-12 py-12">

              <Welcome />

            </section>

            <StatusPanel />

          </div>

        </div>

      </main>
    </AuthGuard>
  );
}