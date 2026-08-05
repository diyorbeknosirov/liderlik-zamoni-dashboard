"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Crown } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(identifier, password);
    setSubmitting(false);
    if (!res.ok) setError(res.error);
    else setError("");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: "linear-gradient(150deg,#F5F7FB,#FFFFFF 60%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style={{ background: COLORS.primary }}>
            <Crown className="text-white" size={26} style={{ color: COLORS.gold }} />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: COLORS.ink }}>Liderlik Zamoni</h1>
          <p className="text-sm mt-1" style={{ color: COLORS.sub }}>Biznes kurslari — sotuv boshqaruv tizimi</p>
        </div>

        <Card className="p-6 sm:p-7">
          <form onSubmit={submit} className="space-y-4">
            <Input label="Email" icon={Mail} placeholder="ism@start.uz" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            <div>
              <span className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>Parol</span>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.sub }} />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border pl-10 pr-10 py-2.5 text-sm outline-none focus:ring-2"
                  style={{ borderColor: COLORS.border }}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm font-medium" style={{ color: COLORS.danger }}>{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Kirilmoqda..." : "Tizimga kirish"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
