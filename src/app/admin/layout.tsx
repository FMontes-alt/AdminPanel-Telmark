import type { Metadata } from "next";
import { Sidebar } from "./components/Sidebar";
import { AdminHeader } from "./components/AdminHeader";
import { SidebarProvider } from "./components/SidebarProvider";

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
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50">
        {/* Navegación Lateral */}
        <Sidebar />

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Cabecera Adaptativa */}
          <AdminHeader />

          {/* Viewport del Contenido */}
          <main className="p-0 w-full overflow-hidden">
              <div className="w-full">
                  {children}
              </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
