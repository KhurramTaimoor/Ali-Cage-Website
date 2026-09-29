import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

export default function AdminChangePasswordPage() {
  const { isRTL = false } = useOutletContext() || {};
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null") || {};
    } catch {
      return {};
    }
  }, []);

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const T = isRTL
    ? {
        title: "ایڈمن پاس ورڈ تبدیل کریں",
        subtitle: "اپنا موجودہ پاس ورڈ درج کریں اور نیا محفوظ پاس ورڈ سیٹ کریں۔",
        current: "موجودہ پاس ورڈ",
        next: "نیا پاس ورڈ",
        confirm: "نیا پاس ورڈ دوبارہ",
        save: "پاس ورڈ تبدیل کریں",
        hint: "کم از کم 8 حروف۔ پاس ورڈ تبدیل ہونے کے بعد دوبارہ لاگ اِن کرنا ہوگا۔",
      }
    : {
        title: "Change Admin Password",
        subtitle: "Verify the current password, then set a new password for this admin account.",
        current: "Current Password",
        next: "New Password",
        confirm: "Confirm New Password",
        save: "Change Password",
        hint: "Use at least 8 characters. You will be asked to sign in again after the password changes.",
      };

  useEffect(() => {
    if (String(user?.role || "").toLowerCase() !== "admin") {
      navigate("/app/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: "error", text: "All password fields are required." });
      return;
    }
    if (form.newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setMessage({ type: "error", text: "New password must be different from the current password." });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/api/auth/change-password`, {
        current_password: form.currentPassword,
        new_password: form.newPassword,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Password change failed");
      }

      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully. Redirecting to secure admin login..." });

      window.setTimeout(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        navigate("/sys-admin/secure-gateway", { replace: true });
      }, 1400);
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.response?.data?.message || error?.message || "Password change failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordField = ({ label, value, field, visibleKey, autoComplete }) => (
    <div>
      <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#65778A]">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole className={`absolute top-1/2 -translate-y-1/2 text-[#8293A5] ${isRTL ? "right-3" : "left-3"}`} size={16} />
        <input
          type={show[visibleKey] ? "text" : "password"}
          value={value}
          onChange={(event) => update(field, event.target.value)}
          autoComplete={autoComplete}
          className={`h-11 w-full rounded-xl border border-[#D7E0EA] bg-[#F9FBFD] text-sm font-semibold text-[#13263A] outline-none transition focus:border-[#4A86F7] focus:bg-white focus:ring-4 focus:ring-[#4A86F7]/10 ${
            isRTL ? "pr-10 pl-11" : "pl-10 pr-11"
          }`}
        />
        <button
          type="button"
          aria-label={show[visibleKey] ? "Hide password" : "Show password"}
          onClick={() => setShow((previous) => ({ ...previous, [visibleKey]: !previous[visibleKey] }))}
          className={`absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#60758A] transition hover:bg-[#EAF2FF] hover:text-[#0B4E9B] ${
            isRTL ? "left-1.5" : "right-1.5"
          }`}
        >
          {show[visibleKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="mx-auto max-w-4xl space-y-4">
      <section className="overflow-hidden rounded-2xl border border-[#DCE4ED] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#E7EDF4] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#0B4E9B]">
              <ShieldCheck size={21} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#13263A] sm:text-2xl">{T.title}</h1>
              <p className="mt-1 text-sm text-[#718296]">{T.subtitle}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#D9E6FA] bg-[#F2F7FF] px-3 py-1.5 text-xs font-bold text-[#0B4E9B]">
            <KeyRound size={14} /> Admin Security
          </div>
        </div>

        <form onSubmit={submit} className="p-5 sm:p-6">
          {message.text && (
            <div
              className={`mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 className="mt-0.5 shrink-0" size={17} /> : <AlertCircle className="mt-0.5 shrink-0" size={17} />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              {passwordField({
                label: T.current,
                value: form.currentPassword,
                field: "currentPassword",
                visibleKey: "current",
                autoComplete: "current-password",
              })}
            </div>
            {passwordField({
              label: T.next,
              value: form.newPassword,
              field: "newPassword",
              visibleKey: "next",
              autoComplete: "new-password",
            })}
            {passwordField({
              label: T.confirm,
              value: form.confirmPassword,
              field: "confirmPassword",
              visibleKey: "confirm",
              autoComplete: "new-password",
            })}
          </div>

          <div className="mt-4 rounded-xl border border-[#E2E9F1] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold leading-5 text-[#65778A]">
            {T.hint}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[#0B4E9B] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0A65BD] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={17} /> : <KeyRound size={17} />}
              {loading ? "Updating..." : T.save}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
