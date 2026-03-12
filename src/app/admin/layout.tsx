import type { Metadata } from "next";
import { Sidebar } from "./components/Sidebar";
import { AdminHeader } from "./components/AdminHeader";

export const metadata: Metadata = {
  title: "Admin Panel | Telmark CMS",
  description: "Gestión de campañas y contenidos",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Navegación Lateral */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        {/* Cabecera Adaptativa */}
        <AdminHeader />

        {/* Viewport del Contenido */}
        <main className="p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}