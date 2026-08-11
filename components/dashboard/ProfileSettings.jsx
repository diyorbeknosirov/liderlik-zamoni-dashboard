"use client";

import { useEffect, useRef, useState } from "react";
import { UserCog, Camera, Check, User as UserIcon, Trash2, Loader2, Send, Link2, RefreshCw } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export default function ProfileSettings({ user, onSave }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [avatarImage, setAvatarImage] = useState(user.avatarImage || null);
  const [pendingFile, setPendingFile] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  // --- Telegramni ulash holati ---
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [linkUrl, setLinkUrl] = useState(null);
  const [linkError, setLinkError] = useState("");

  const initials = (firstName[0] || "") + (lastName[0] || "");

  const checkTelegramStatus = async () => {
    setCheckingLink(true);
    const { data } = await supabase
      .from("profiles")
      .select("telegram_user_id")
      .eq("id", user.id)
      .single();
    setTelegramLinked(!!data?.telegram_user_id);
    setCheckingLink(false);
  };

  useEffect(() => {
    checkTelegramStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateLinkCode = async () => {
    setGeneratingCode(true);
    setLinkError("");
    setLinkUrl(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Sessiya topilmadi, qayta kiring.");

      const res = await fetch("/api/telegram/generate-link-code", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || "Xatolik yuz berdi.");

      setLinkUrl(result.linkUrl);
    } catch (err) {
      setLinkError(err.message || "Kod yaratishda xatolik.");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Faqat rasm fayllarini yuklash mumkin."); return; }
    if (file.size > MAX_FILE_SIZE) { setError("Rasm hajmi 3MB dan oshmasligi kerak."); return; }
    setError("");
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarImage(reader.result); // preview
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarImage(null);
    setPendingFile(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) { setError("Ism va familiyani to'ldiring."); return; }
    setError("");
    setSaving(true);
    try {
      let finalUrl = avatarImage && avatarImage.startsWith("http") ? avatarImage : user.avatarImage || null;

      if (pendingFile) {
        const ext = pendingFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, pendingFile, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        finalUrl = `${data.publicUrl}?t=${Date.now()}`; // cache-bust
      } else if (avatarImage === null) {
        finalUrl = null;
      }

      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatarImage: finalUrl,
      });

      setAvatarImage(finalUrl);
      setPendingFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      <Card className="p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-5">
          <UserCog size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-base" style={{ color: COLORS.ink }}>Profil sozlamalari</h3>
        </div>

        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: COLORS.successBg, color: COLORS.success }}>
            <Check size={16} /> Profil muvaffaqiyatli yangilandi.
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <Avatar initials={initials.toUpperCase()} src={avatarImage} size={72} />
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>
                <Camera size={15} /> Rasm yuklash
              </button>
              {avatarImage && (
                <button type="button" onClick={removeAvatar} className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>
                  <Trash2 size={15} /> O'chirish
                </button>
              )}
            </div>
            <p className="text-xs" style={{ color: COLORS.sub }}>JPG yoki PNG, maksimal 3MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Ism" icon={UserIcon} required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Familiya" icon={UserIcon} required value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <div className="rounded-xl p-3 text-sm" style={{ background: "#F9FAFB", color: COLORS.sub }}>
            <p><span className="font-medium" style={{ color: COLORS.ink }}>Email:</span> {user.email}</p>
            <p className="mt-1"><span className="font-medium" style={{ color: COLORS.ink }}>Rol:</span> {user.role === "admin" ? "Administrator" : "Sotuvchi"}</p>
          </div>

          {error && <p className="text-sm font-medium" style={{ color: COLORS.danger }}>{error}</p>}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </form>
      </Card>

      <Card className="p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-4">
          <Send size={18} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-base" style={{ color: COLORS.ink }}>Telegram Bot</h3>
        </div>

        {checkingLink ? (
          <p className="text-sm flex items-center gap-2" style={{ color: COLORS.sub }}>
            <Loader2 size={14} className="animate-spin" /> Tekshirilmoqda...
          </p>
        ) : telegramLinked ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.success }}>
              <Check size={16} /> Telegram akkauntingiz ulangan
            </div>
            <button
              type="button"
              onClick={checkTelegramStatus}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
              style={{ background: COLORS.primaryLight, color: COLORS.primary }}
            >
              <RefreshCw size={12} /> Yangilash
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: COLORS.sub }}>
              Operatorlar guruhida mijozlarni "olish" va Demo belgilash uchun,
              Telegram akkauntingizni shu hisobingizga ulashingiz kerak.
            </p>

            {!linkUrl ? (
              <Button type="button" onClick={handleGenerateLinkCode} disabled={generatingCode} className="w-full">
                {generatingCode ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
                {generatingCode ? "Kod yaratilmoqda..." : "Telegramni ulash"}
              </Button>
            ) : (
              <div className="space-y-2">
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl" style={{ background: COLORS.primary, color: "#fff" }}><Send size={15} /> Botda ulashni yakunlash</a>
                <p className="text-xs" style={{ color: COLORS.sub }}>
                  Havola sizni to'g'ridan-to'g'ri botga olib boradi. Bosgach, avtomatik ulanadi.
                  Kod 10 daqiqa amal qiladi.
                </p>
                <button
                  type="button"
                  onClick={checkTelegramStatus}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                  style={{ background: COLORS.primaryLight, color: COLORS.primary }}
                >
                  <RefreshCw size={12} /> Ulanganini tekshirish
                </button>
              </div>
            )}

            {linkError && <p className="text-sm font-medium" style={{ color: COLORS.danger }}>{linkError}</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
