import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

export const metadata = {
  title: "Liderlik Zamoni | Biznes kurslari sotuv boshqaruvi",
  description: "Liderlik Zamoni biznes kurslari uchun vizual va interaktiv Sales Dashboard / Leaderboard tizimi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
