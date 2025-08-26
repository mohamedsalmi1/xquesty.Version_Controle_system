import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function GlobeIcon({ className = "w-7 h-7 mr-2 inline-block align-text-bottom" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="14" cy="14" rx="5.5" ry="12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 14h24" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const LANGUAGES = [
  { code: 'ar', label: 'العربية (المغرب)' },
  { code: 'en', label: 'English (US)' },
  { code: 'fr', label: 'Français (France)' },
];

const sortedLanguages = [...LANGUAGES].sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    const found = sortedLanguages.find(l => l.code === i18n.language);
    return found || sortedLanguages[1]; // Default to English
  });
  const listRef = useRef(null);

  useEffect(() => {
    setSelected(sortedLanguages.find(l => l.code === i18n.language) || sortedLanguages[1]);
  }, [i18n.language]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (listRef.current && !listRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang.code);
    setSelected(lang);
    setOpen(false);
  };

  return (
    <div className="relative w-full sm:w-auto" style={{ minWidth: 120 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:underline focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={open}
        tabIndex={0}
      >
        <GlobeIcon className="w-5 h-5 text-gray-500" />
        {selected.label}
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-2 bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-y-auto"
          style={{ minWidth: 200 }}
        >
          {sortedLanguages.map(lang => (
            <button
              key={lang.code}
              className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                selected.code === lang.code ? 'font-semibold bg-gray-50' : ''
              }`}
              onClick={() => handleLanguageChange(lang)}
              tabIndex={0}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
