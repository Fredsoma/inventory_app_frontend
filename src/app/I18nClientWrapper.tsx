"use client";

import { useLayoutEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n"; // Adjust the path if needed

export default function I18nClientWrapper({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en";
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []); // Removed i18n from the dependency array

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
