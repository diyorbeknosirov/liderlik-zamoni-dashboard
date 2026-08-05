"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useLiveSaleToasts } from "@/hooks/useLiveSaleToasts";
import { useCheckIn } from "@/hooks/useCheckIn";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import CelebrationOverlay from "@/components/layout/CelebrationOverlay";
import MotivationBanner from "@/components/dashboard/MotivationBanner";
import WelcomeModal from "@/components/dashboard/WelcomeModal";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { operators, tariffs, invoices, newSaleEvent } = useData();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { current, dismissCurrent } = useLiveSaleToasts(newSaleEvent, operators, tariffs);
  const { session: checkInSession, loading: checkInLoading, checkIn, checkOut, hasCheckedIn, hasCheckedOut } = useCheckIn(user);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#FBFBFD" }}>
        <p className="text-sm text-gray-400">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!user) return null;

  const isOperator = user.role === "operator";
  const myOperator = isOperator ? operators.find((o) => o.id === user.id) : null;
  const showWelcome = isOperator && !checkInLoading && !hasCheckedIn;

  const today = todayStr();
  const monthPrefix = today.slice(0, 7);
  const myMonthInvoices = myOperator
    ? invoices.filter((inv) => inv.operatorId === myOperator.id && inv.date?.startsWith(monthPrefix))
    : [];
  const monthSold = myMonthInvoices.reduce((s, inv) => s + inv.amount, 0);
  const salesCount = myMonthInvoices.length;

  return (
    <div className="min-h-screen w-full flex" style={{ background: "#FBFBFD" }}>
      <CelebrationOverlay event={current} onDismiss={dismissCurrent} />
      {showWelcome && myOperator && (
        <WelcomeModal user={user} operator={myOperator} monthSold={monthSold} salesCount={salesCount} onConfirm={checkIn} />
      )}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        checkInSession={checkInSession}
        hasCheckedIn={hasCheckedIn}
        hasCheckedOut={hasCheckedOut}
        onCheckOut={checkOut}
      />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Topbar setMobileOpen={setMobileOpen} />
        <MotivationBanner />
        {children}
      </main>
    </div>
  );
}
