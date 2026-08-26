/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";

export const LanguageContext = createContext();

/**
 * Utility function to determine the initial language.
 * Priority:
 * 1. Previously saved preference in localStorage
 * 2. Browser language setting (Swedish if starts with 'sv', otherwise English)
 */
function getInitialLanguage() {
    const savedLang = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    if (savedLang === "sv" || savedLang === "en") {
        return savedLang;
    }

    if (typeof navigator !== "undefined" && navigator.language) {
        const userLang = navigator.language.toLowerCase();
        if (userLang.startsWith("sv")) {
            return "sv";
        }
    }

    return "en";
}

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => getInitialLanguage());

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("lang", lang);
        }
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}