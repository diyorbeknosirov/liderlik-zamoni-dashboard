"use client";

import { useEffect, useRef, useState } from "react";
import { playChime } from "@/lib/playChime";

/**
 * Supabase realtime orqali kelgan "yangi sotuv" hodisalarini navbat
 * (queue) ko'rinishida ushlab turadi — CelebrationOverlay shu navbatni
 * birma-bir ko'rsatadi. `newSaleEvent` — DataContext dan keladigan xom
 * `sales` qatori (operator_id, amount, tariff_id, client_name).
 */
export function useLiveSaleToasts(newSaleEvent, operators, tariffs) {
  const [queue, setQueue] = useState([]);
  const lastIdRef = useRef(null);

  useEffect(() => {
    if (!newSaleEvent || newSaleEvent.id === lastIdRef.current) return;

    const op = operators.find((o) => o.id === newSaleEvent.operator_id);
    // Operator ro'yxati hali yangilanmagan bo'lishi mumkin — bu holda
    // keyingi operators yangilanishida qayta urinib ko'ramiz (id'ni
    // "qayta ishlangan" deb belgilamaymiz).
    if (!op) return;

    lastIdRef.current = newSaleEvent.id;
    const tariff = tariffs.find((t) => t.id === newSaleEvent.tariff_id);

    const item = {
      id: newSaleEvent.id,
      name: `${op.firstName} ${op.lastName}`.trim() || "Noma'lum sotuvchi",
      avatar: op.avatar,
      avatarImage: op.avatarImage,
      team: op.team,
      tariff: tariff?.name || newSaleEvent.tariff_label || "",
      amount: Number(newSaleEvent.amount),
    };

    playChime();
    setQueue((prev) => [...prev, item]);
  }, [newSaleEvent, operators, tariffs]);

  const dismissCurrent = () => setQueue((prev) => prev.slice(1));

  return { current: queue[0] || null, dismissCurrent };
}
