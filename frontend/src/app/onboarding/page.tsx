"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ────────────── Constants ──────────────
const STEPS = [
  { id: 1, title: "Role Confirmation", description: "Who are you?", emoji: "🧑‍💼" },
  { id: 2, title: "Profile Information", description: "Tell us about yourself", emoji: "📝" },
  { id: 3, title: "Preferences", description: "Customize your experience", emoji: "⚙️" },
  { id: 4, title: "Verification", description: "Verify your identity", emoji: "🔐" },
];

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Marathi"];
type Role = "citizen" | "lawyer";

// ────────────── Error/Field Components ──────────────
function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="text-red-400 text-xs mt-1 overflow-hidden"
        >
          ⚠ {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

interface InputFieldProps {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  accent?: "blue" | "emerald";
}

function InputField({ label, required, placeholder, value, onChange, error, type = "text", accent = "blue" }: InputFieldProps) {
  const focusCls = accent === "emerald"
    ? "focus:ring-emerald-500/40 focus:border-emerald-500/40"
    : "focus:ring-blue-500/40 focus:border-blue-500/40";

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {label}{required && " *"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 transition-all text-sm ${
          error
            ? "border-red-500/50 focus:ring-red-500/30"
            : `border-white/10 ${focusCls}`
        }`}
        placeholder={placeholder}
      />
      <FieldError msg={error} />
    </div>
  );
}

// ────────────── Completion Screen ──────────────
function CompletionScreen({ role }: { role: Role }) {
  return (
    <div className="text-center py-8 px-4 space-y-6">
      <motion.div
        className="relative inline-block"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.1 }}
      >
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 scale-150 animate-ping opacity-30" />
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 scale-[1.8]" />
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-5xl shadow-xl shadow-emerald-500/30 relative">
          🎉
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-black text-white">You're all set!</h2>
        <p className="text-white/50 text-sm mt-2 leading-relaxed">
          Your {role === "lawyer" ? "lawyer" : "citizen"} profile has been created successfully.
          <br />
          Redirecting you to your dashboard…
        </p>
      </motion.div>

      <motion.div
        className="flex justify-center gap-3 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {["Legal Rights", "File Complaint", "Track Cases", role === "lawyer" ? "Manage Clients" : "Get Legal Aid"].map((feat) => (
          <span key={feat} className="px-3 py-1.5 bg-white/[0.06] border border-white/10 rounded-full text-xs font-medium text-white/60">
            ✓ {feat}
          </span>
        ))}
      </motion.div>

      <motion.div
        className="h-1 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.8, delay: 0.6, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

// ────────────── Main Page ──────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1
  const [role, setRole] = useState<Role>("citizen");

  // Step 2
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [barNumber, setBarNumber] = useState("");
  const [barCouncil, setBarCouncil] = useState("");

  // Step 3
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Formal");
  const [notifications, setNotifications] = useState(true);

  // Step 4
  const [idFile, setIdFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill from existing user data
  useEffect(() => {
    if (user) {
      setRole(user.role === "lawyer" ? "lawyer" : "citizen");
      setFullName(user.full_name || "");
      if (user.onboarding_step > 0 && user.onboarding_step <= 4) {
        setStep(user.onboarding_step);
      }
      if (user.onboarding_completed) {
        router.replace(user.role === "lawyer" ? "/lawyer/dashboard" : "/citizen/dashboard");

      }
    }
  }, [user, router]);

  const updateOnboarding = async (currentStep: number, completed = false) => {
    try {
      setIsLoading(true);
      await api.put("users/onboarding", { step: currentStep, completed });


      if (user && token) {
        const updatedUser = { ...user, onboarding_step: currentStep, onboarding_completed: completed };
        localStorage.setItem("user_cache", JSON.stringify(updatedUser));
        document.cookie = `onboarding_completed=${completed}; path=/; SameSite=Lax`;
      }

      if (completed) {
        setIsCompleted(true);
        setTimeout(() => {
          window.location.href = role === "lawyer" ? "/lawyer/dashboard" : "/citizen/dashboard";

        }, 2200);
      } else {
        setStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Failed to update onboarding", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (!/^[+\d][\d\s\-()]{7,14}$/.test(phone.trim())) e.phone = "Enter a valid phone number";
    if (!location.trim()) e.location = "City/State is required";
    if (role === "lawyer") {
      if (!specialization.trim()) e.specialization = "Specialization is required";
      if (!barNumber.trim()) e.barNumber = "Bar enrollment number is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      alert("Only JPEG, PNG, WebP, or PDF files are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5 MB.");
      return;
    }
    setIdFile(file);
    setUploadStatus("done");
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const syntheticEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(syntheticEvent);
    }
  };

  const handleNext = async () => {
    setErrors({});
    if (step === 1) {
      await updateOnboarding(1);
    } else if (step === 2) {
      if (!validateStep2()) return;
      try {
        await api.put("users/me", {

          full_name: fullName,
          phone,
          location,
          ...(role === "lawyer" ? { specialization, bar_number: barNumber, bar_council: barCouncil } : {}),
        });
      } catch (_) { /* non-blocking */ }
      await updateOnboarding(2);
    } else if (step === 3) {
      await updateOnboarding(3);
    } else if (step === 4) {
      await updateOnboarding(4, true);
    }
  };

  const progress = (step / 4) * 100;

  // ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040b1a] via-[#080f22] to-[#0c1830] text-white flex items-center justify-center p-4">

      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-900/4 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg w-full relative z-10">

        {/* Brand header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-xl shadow-blue-900/40 mb-4">
            <span className="text-2xl">⚖️</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200">
            Neethivaan AI
          </h1>
          <p className="text-sm text-blue-300/40 mt-1 font-medium">Your Legal Rights, Powered by AI</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="backdrop-blur-2xl bg-white/[0.05] border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/60 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Progress bar */}
          <div className="h-1 w-full bg-white/[0.04]">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: isCompleted ? "100%" : `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 18 }}
            />
          </div>

          {isCompleted ? (
            <div className="px-8 py-8">
              <CompletionScreen role={role} />
            </div>
          ) : (
            <>
              {/* Step indicators */}
              <div className="flex items-center justify-between px-8 pt-6 pb-4">
                {STEPS.map((s, idx) => {
                  const isCompleted = s.id < step;
                  const isCurrent = s.id === step;
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-2">
                      <motion.div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30"
                            : isCurrent
                            ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/20"
                            : "bg-transparent border-white/10 text-white/20"
                        }`}
                        whileHover={isCurrent ? { scale: 1.05 } : {}}
                      >
                        {isCompleted ? "✓" : s.emoji}
                      </motion.div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block transition-colors ${
                        isCurrent ? "text-blue-300" : isCompleted ? "text-emerald-400" : "text-white/15"
                      }`}>
                        {s.title.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Inner form */}
              <div className="px-8 pb-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">{STEPS[step - 1].title}</h2>
                  <p className="text-sm text-blue-200/40 mt-0.5">{STEPS[step - 1].description}</p>
                </div>

                <div className="min-h-[290px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -40, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >

                      {/* ── Step 1: Role ── */}
                      {step === 1 && (
                        <div className="space-y-5">
                          <p className="text-sm text-white/40">
                            Select the role that best describes you. This tailors your entire experience.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {(["citizen", "lawyer"] as Role[]).map((r) => (
                              <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                                  role === r
                                    ? r === "citizen"
                                      ? "bg-blue-500/12 border-blue-400 shadow-lg shadow-blue-500/15"
                                      : "bg-emerald-500/12 border-emerald-400 shadow-lg shadow-emerald-500/15"
                                    : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                                }`}
                              >
                                {role === r && (
                                  <motion.span
                                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                                  >
                                    ✓
                                  </motion.span>
                                )}
                                <div className="text-3xl mb-3">{r === "citizen" ? "⚖️" : "👨‍⚖️"}</div>
                                <div className="font-bold text-white capitalize text-sm">{r}</div>
                                <div className="text-xs text-white/35 mt-1 leading-relaxed">
                                  {r === "citizen" ? "Seeking legal aid & rights info" : "Offering legal expertise"}
                                </div>
                              </button>
                            ))}
                          </div>

                          <div className={`p-4 rounded-xl border text-sm transition-all ${
                            role === "citizen"
                              ? "bg-blue-500/8 border-blue-500/15 text-blue-200/60"
                              : "bg-emerald-500/8 border-emerald-500/15 text-emerald-200/60"
                          }`}>
                            {role === "citizen"
                              ? "🏛️ As a citizen, file complaints, track cases, and access AI-powered legal guidance."
                              : "📋 As a lawyer, receive case assignments, manage clients, and provide expert legal services."}
                          </div>
                        </div>
                      )}

                      {/* ── Step 2: Profile ── */}
                      {step === 2 && (
                        <div className="space-y-4">
                          <InputField
                            label="Full Name"
                            required
                            placeholder="e.g. Priya Sharma"
                            value={fullName}
                            onChange={setFullName}
                            error={errors.fullName}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <InputField
                              label="Phone Number"
                              required
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={phone}
                              onChange={setPhone}
                              error={errors.phone}
                            />
                            <InputField
                              label="City / State"
                              required
                              placeholder="Chennai, TN"
                              value={location}
                              onChange={setLocation}
                              error={errors.location}
                            />
                          </div>

                          <AnimatePresence>
                            {role === "lawyer" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden"
                              >
                                <div className="h-px bg-white/[0.06] my-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">
                                  Lawyer Details
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                  <InputField
                                    label="Specialization"
                                    required
                                    placeholder="Criminal Law"
                                    value={specialization}
                                    onChange={setSpecialization}
                                    error={errors.specialization}
                                    accent="emerald"
                                  />
                                  <InputField
                                    label="Bar Enrolment No."
                                    required
                                    placeholder="BCI/TN/2023/1234"
                                    value={barNumber}
                                    onChange={setBarNumber}
                                    error={errors.barNumber}
                                    accent="emerald"
                                  />
                                </div>
                                <InputField
                                  label="Bar Council"
                                  placeholder="Tamil Nadu Bar Council"
                                  value={barCouncil}
                                  onChange={setBarCouncil}
                                  accent="emerald"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* ── Step 3: Preferences ── */}
                      {step === 3 && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Preferred Language</label>
                            <div className="flex flex-wrap gap-2">
                              {LANGUAGES.map((lang) => (
                                <button
                                  key={lang}
                                  onClick={() => setLanguage(lang)}
                                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                    language === lang
                                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/25"
                                      : "bg-white/[0.03] border-white/[0.08] text-white/45 hover:border-white/20 hover:text-white/70"
                                  }`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">AI Communication Style</label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { key: "Formal", icon: "👔", desc: "Professional & precise" },
                                { key: "Friendly", icon: "😊", desc: "Warm & conversational" },
                              ].map(({ key, icon, desc }) => (
                                <button
                                  key={key}
                                  onClick={() => setTone(key)}
                                  className={`p-4 rounded-xl border text-center transition-all ${
                                    tone === key
                                      ? "bg-white/[0.09] border-white/25 text-white"
                                      : "bg-white/[0.02] border-white/[0.07] text-white/35 hover:bg-white/[0.06]"
                                  }`}
                                >
                                  <div className="text-xl mb-1.5">{icon}</div>
                                  <div className="font-semibold text-sm">{key}</div>
                                  <div className="text-xs text-white/35 mt-0.5">{desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                            <div>
                              <div className="text-sm font-semibold text-white">Case Update Notifications</div>
                              <div className="text-xs text-white/35 mt-0.5">Alerts when your case status changes</div>
                            </div>
                            <button
                              onClick={() => setNotifications(!notifications)}
                              className={`relative w-11 h-6 rounded-full border transition-all ${
                                notifications ? "bg-blue-600 border-blue-500" : "bg-white/10 border-white/20"
                              }`}
                            >
                              <motion.div
                                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                                animate={{ left: notifications ? "calc(100% - 22px)" : "2px" }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Step 4: Verification ── */}
                      {step === 4 && (
                        <div className="space-y-5">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all group ${
                              idFile
                                ? "border-emerald-400/50 bg-emerald-500/8"
                                : "border-white/12 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-400/35"
                            }`}
                          >
                            {idFile ? (
                              <>
                                <motion.div
                                  className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center text-2xl"
                                  initial={{ scale: 0.6 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                                >
                                  ✅
                                </motion.div>
                                <div className="text-center">
                                  <div className="font-semibold text-emerald-300 text-sm">{idFile.name}</div>
                                  <div className="text-xs text-emerald-400/60 mt-1">
                                    {(idFile.size / 1024).toFixed(0)} KB · Click to change
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                  📤
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold text-white/75 text-sm">Upload ID Document</div>
                                  <div className="text-xs text-white/35 mt-1">Aadhaar, PAN card, Passport, or Voter ID</div>
                                  <div className="text-xs text-white/20 mt-0.5">JPEG, PNG, PDF · Max 5 MB · Drag & drop supported</div>
                                </div>
                              </>
                            )}
                          </button>

                          <div className="grid grid-cols-3 gap-3 text-center">
                            {[
                              { icon: "🪪", label: "Aadhaar" },
                              { icon: "💳", label: "PAN Card" },
                              { icon: "🛂", label: "Passport" },
                            ].map(({ icon, label }) => (
                              <div key={label} className="p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                                <div className="text-lg">{icon}</div>
                                <div className="text-xs text-white/35 mt-1 font-medium">{label}</div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-start gap-3 p-4 bg-amber-500/[0.07] border border-amber-500/15 rounded-xl">
                            <span className="text-amber-400 text-base mt-0.5 flex-shrink-0">🔒</span>
                            <p className="text-xs text-amber-200/55 leading-relaxed">
                              Documents are encrypted end-to-end and used only for identity verification.
                              We never share your personal data with third parties.
                            </p>
                          </div>

                          <button
                            onClick={() => updateOnboarding(4, true)}
                            disabled={isLoading}
                            className="w-full py-2.5 text-sm text-white/30 hover:text-white/55 transition-colors underline underline-offset-2"
                          >
                            Skip for now →
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation buttons */}
                <div className={`mt-8 flex gap-3 ${step > 1 ? "flex-row" : "flex-col"}`}>
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      disabled={isLoading}
                      className="flex-1 py-3.5 rounded-2xl font-semibold text-sm bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] transition-all disabled:opacity-40"
                    >
                      ← Back
                    </button>
                  )}

                  {step < 4 && (
                    <button
                      onClick={handleNext}
                      disabled={isLoading}
                      className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving…
                        </span>
                      ) : "Continue →"}
                    </button>
                  )}

                  {step === 4 && (
                    <button
                      onClick={handleNext}
                      disabled={isLoading}
                      className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:opacity-90 shadow-lg shadow-indigo-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Completing…
                        </span>
                      ) : "🎉 Complete Setup"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>

        <p className="text-center text-[11px] text-white/15 mt-6">
          Your data is secure and encrypted · By continuing, you agree to our{" "}
          <span className="underline underline-offset-2 cursor-pointer hover:text-white/30 transition-colors">Terms</span>
          {" "}&amp;{" "}
          <span className="underline underline-offset-2 cursor-pointer hover:text-white/30 transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
