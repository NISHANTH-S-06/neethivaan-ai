"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

type Language = "en" | "hi" | "ta";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// ... translations remain exactly the same until line 161 ...
const translations: Record<Language, Record<string, string>> = {
  en: {
    navbar_dashboard: "Dashboard",
    navbar_file_complaint: "File Complaint",
    navbar_legal_portal: "Legal Portal",
    navbar_track_complaint: "Track Complaint",
    navbar_login: "Login",
    navbar_logout: "Sign Out",
    dash_welcome: "Welcome,",
    dash_counselor: "Counselor",
    dash_subtitle: "Your high-fidelity workspace for legal synthesis and case management.",
    dash_total_complaints: "Total Complaints",
    dash_awaiting_analysis: "Awaiting Analysis",
    dash_resolved_cases: "Resolved Cases",
    dash_recent_activity: "Recent Activity",
    dash_global_search: "Global Case Discovery",
    dash_search_placeholder: "Case citation or keywords...",
    dash_init_research: "Initialize Research",
    dash_verification_status: "Verification Status",
    dash_systems_nominal: "Systems Nominal",
    track_title: "Track Your Complaint",
    track_subtitle: "Enter your unique Case ID to view real-time status updates and AI-generated legal analysis.",
    track_placeholder: "Ex: NEETH-20260319-00001",
    track_button: "Track",
    track_login_alert: "Please login to track a complaint.",
    track_error_not_found: "Complaint not found. Please check the Case ID.",
    track_error_generic: "An error occurred while fetching the complaint.",
    dash_system_integrity: "System Integrity",
    dash_ai_classification: "AI Classification",
    dash_rag_verification: "RAG Verification",
    dash_data_integrity: "Data Integrity",
    dash_legal_analysis: "Legal AI Analysis",
    dash_ai_researching: "AI is currently researching the statutes for your case. Please check back in a few minutes.",
    fir_summary: "Official FIR Summary",
    fir_description: "Procedural documentation for law enforcement",
    fir_not_generated: "No official FIR has been generated for this case yet.",
    fir_request_button: "Request FIR Generation",
    fir_only_admin: "Only administrators and registered lawyers can request FIR generation.",
    statutory_references: "Statutory References",
    statutory_fallback: "AI context retrieved from IPC and CrPC databases.",
    track_location: "Location",
    track_type: "Type",
    track_original_desc: "Original Description",
    track_na: "N/A",
    track_general: "General",
    track_security_footer: "Your data is secured with AES-256 encryption and processed via private cloud nodes.",
    badge_complete: "COMPLETE",
    badge_verified: "VERIFIED",
    badge_hashed: "HASHED",
  },
  hi: {
    navbar_dashboard: "डैशबोर्ड",
    navbar_file_complaint: "शिकायत दर्ज करें",
    navbar_legal_portal: "कानूनी पोर्टल",
    navbar_track_complaint: "शिकायत ट्रैक करें",
    navbar_login: "लॉगिन",
    navbar_logout: "साइन आउट",
    dash_welcome: "स्वागत है,",
    dash_counselor: "सलाहकार",
    dash_subtitle: "कानूनी संश्लेषण और केस प्रबंधन के लिए आपका उच्च-निष्ठा वाला कार्यक्षेत्र।",
    dash_total_complaints: "कुल शिकायतें",
    dash_awaiting_analysis: "विश्लेषण की प्रतीक्षा में",
    dash_resolved_cases: "सुलझाए गए मामले",
    dash_recent_activity: "हाल की गतिविधि",
    dash_global_search: "वैश्विक केस खोज",
    dash_search_placeholder: "केस प्रशस्ति पत्र या कीवर्ड...",
    dash_init_research: "अनुसंधान प्रारंभ करें",
    dash_verification_status: "सत्यापन स्थिति",
    dash_systems_nominal: "सिस्टम सामान्य",
    track_title: "अपनी शिकायत ट्रैक करें",
    track_subtitle: "वास्तविक समय स्थिति अपडेट और एआई-जनित कानूनी विश्लेषण देखने के लिए अपनी विशिष्ट केस आईडी दर्ज करें।",
    track_placeholder: "उदा: NEETH-20260319-00001",
    track_button: "ट्रैक करें",
    track_login_alert: "शिकायत ट्रैक करने के लिए कृपया लॉगिन करें।",
    track_error_not_found: "शिकायत नहीं मिली। कृपया केस आईडी जांचें।",
    track_error_generic: "शिकायत प्राप्त करते समय एक त्रुटि हुई।",
    dash_system_integrity: "सिस्टम अखंडता",
    dash_ai_classification: "एआई वर्गीकरण",
    dash_rag_verification: "आरएजी सत्यापन",
    dash_data_integrity: "डेटा अखंडता",
    dash_legal_analysis: "कानूनी एआई विश्लेषण",
    dash_ai_researching: "एआई वर्तमान में आपके मामले के लिए कानूनों पर शोध कर रहा है। कृपया कुछ ही मिनटों में दोबारा जांचें।",
    fir_summary: "आधिकारिक एफआईआर सारांश",
    fir_description: "कानून प्रवर्तन के लिए प्रक्रियात्मक दस्तावेज",
    fir_not_generated: "इस मामले के लिए अभी तक कोई आधिकारिक एफआईआर तैयार नहीं की गई है।",
    fir_request_button: "एफआईआर जनरेशन का अनुरोध करें",
    fir_only_admin: "केवल प्रशासक और पंजीकृत वकील ही एफआईआर जनरेशन का अनुरोध कर सकते हैं।",
    statutory_references: "वैधानिक संदर्भ",
    statutory_fallback: "IPC और CrPC डेटाबेस से प्राप्त AI संदर्भ।",
    track_location: "स्थान",
    track_type: "प्रकार",
    track_original_desc: "मूल विवरण",
    track_na: "एन/ए",
    track_general: "सामान्य",
    track_security_footer: "आपका डेटा AES-256 एन्क्रिप्शन के साथ सुरक्षित है और निजी क्लाउड नोड्स के माध्यम से संसाधित किया जाता है।",
    badge_complete: "पूर्ण",
    badge_verified: "सत्यापित",
    badge_hashed: "हैशेड",
  },
  ta: {
    navbar_dashboard: "டாஷோர்டு",
    navbar_file_complaint: "புகார் பதிவு செய்க",
    navbar_legal_portal: "சட்ட போர்டல்",
    navbar_track_complaint: "புகாரைக் கண்காணிக்க",
    navbar_login: "உள்நுழை",
    navbar_logout: "வெளியேறு",
    dash_welcome: "வரவேற்கிறோம்,",
    dash_counselor: "வழக்கறிஞர்",
    dash_subtitle: "சட்ட தொகுப்பு மற்றும் வழக்கு மேலாண்மைக்கான உங்கள் உயர்-திறன் பணிமனை.",
    dash_total_complaints: "மொத்த புகார்கள்",
    dash_awaiting_analysis: "பகுப்பாய்விற்காக காத்திருக்கிறது",
    dash_resolved_cases: "தீர்க்கப்பட்ட வழக்குகள்",
    dash_recent_activity: "சமீபத்திய நடவடிக்கை",
    dash_global_search: "உலகளாவிய வழக்கு கண்டுபிடிப்பு",
    dash_search_placeholder: "வழக்கு மேற்கோள் அல்லது முக்கிய வார்த்தைகள்...",
    dash_init_research: "ஆராய்ச்சியைத் தொடங்குங்கள்",
    dash_verification_status: "சரிபார்ப்பு நிலை",
    dash_systems_nominal: "அமைப்புகள் இயல்பானவை",
    track_title: "உங்கள் புகாரைக் கண்காணிக்கவும்",
    track_subtitle: "நிகழ்நேர நிலை புதுப்பிப்புகள் மற்றும் AI-உருவாக்கிய சட்டப் பகுப்பாய்வைப் பார்க்க உங்கள் தனித்துவமான வழக்கு ஐடியை உள்ளிடவும்.",
    track_placeholder: "எடுத்துக்காட்டு: NEETH-20260319-00001",
    track_button: "கண்காணி",
    track_login_alert: "புகாரைக் கண்காணிக்க உள்நுழையவும்.",
    track_error_not_found: "புகார் கிடைக்கவில்லை. வழக்கு ஐடியைச் சரிபார்க்கவும்.",
    track_error_generic: "புகாரைப் பெறும்போது ஒரு பிழை ஏற்பட்டது.",
    dash_system_integrity: "அமைப்பு ஒருமைப்பாடு",
    dash_ai_classification: "AI வகைப்பாடு",
    dash_rag_verification: "RAG சரிபார்ப்பு",
    dash_data_integrity: "தரவு ஒருமைப்பாடு",
    dash_legal_analysis: "சட்ட AI பகுப்பாய்வு",
    dash_ai_researching: "AI தற்போது உங்கள் வழக்கின் சட்டங்களை ஆராய்ந்து வருகிறது. சில நிமிடங்களில் மீண்டும் பார்க்கவும்.",
    fir_summary: "அதிகாரப்பூர்வ FIR சுருக்கம்",
    fir_description: "சட்ட அமலாக்கத்திற்கான நடைமுறை ஆவணங்கள்",
    fir_not_generated: "இந்த வழக்கிற்கு இன்னும் அதிகாரப்பூர்வ FIR உருவாக்கப்படவில்லை.",
    fir_request_button: "FIR உருவாக்கத்தைக் கோருங்கள்",
    fir_only_admin: "நிர்வாகிகள் மற்றும் பதிவுசெய்யப்பட்ட வழக்கறிஞர்கள் மட்டுமே FIR உருவாக்கத்தைக் கோர முடியும்.",
    statutory_references: "சட்டப்பூர்வ குறிப்புகள்",
    statutory_fallback: "IPC மற்றும் CrPC தரவுத்தளங்களிலிருந்து மீட்டெடுக்கப்பட்ட AI சூழல்.",
    track_location: "இடம்",
    track_type: "வகை",
    track_original_desc: "அசல் விளக்கம்",
    track_na: "இல்லை",
    track_general: "பொதுவானது",
    track_security_footer: "உங்கள் தரவு AES-256 என்க்ரிப்ஷன் மூலம் பாதுகாக்கப்படுகிறது மற்றும் தனியார் கிளவுட் முனையங்கள் மூலம் செயலாக்கப்படுகிறது.",
    badge_complete: "முடிந்தது",
    badge_verified: "சரிபார்க்கப்பட்டது",
    badge_hashed: "ஹாஷேடு",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Phase 5: Load from localStorage on app load and listen for tab changes
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language;
    if (saved && (saved === "en" || saved === "hi" || saved === "ta")) {
      setLanguageState(saved);
    }
    
    // Listen for changes from other tabs to update instantly
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lang" && e.newValue) {
        if (e.newValue === "en" || e.newValue === "hi" || e.newValue === "ta") {
          setLanguageState(e.newValue as Language);
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
    // document.cookie can also be set here if needed by SSR middleware
    document.cookie = `lang=${lang}; path=/; SameSite=Lax`;
  }, []);

  const t = useCallback((key: string) => {
    return translations[language][key] || key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
