import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import GlobalHooks from "./components/GlobalHooks";

export const metadata = {
  title: "CampusOR",
  description: "Campus Online Queue & Reservation System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <GlobalHooks />
          {children}
          <Toaster position="top-right" richColors closeButton/>
        </AuthProvider>
      </body>
    </html>
  );
}
