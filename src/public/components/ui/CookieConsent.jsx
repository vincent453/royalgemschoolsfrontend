import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCookieBite, FaTimes } from "react-icons/fa";

const STORAGE_KEY = "royalGemCookieConsent";

export default function CookieConsent() {
  const [choice, setChoice] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [open, setOpen] = useState(!choice);

  useEffect(() => {
    setOpen(!choice);
  }, [choice]);

  const saveChoice = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Continue for visitors whose browser blocks local storage.
    }
    setChoice(value);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-[#a13ea1] text-white shadow-lg transition hover:bg-[#7a2079] focus:outline-none focus:ring-2 focus:ring-[#f056f0] focus:ring-offset-2"
        aria-label="Manage cookie preferences"
        title="Manage cookie preferences"
      >
        <FaCookieBite />
      </button>
    );
  }

  return (
    <aside
      role="dialog"
      aria-label="Cookie and privacy preferences"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-[#f056f0]/20 bg-white p-5 shadow-2xl md:bottom-6 md:left-6 md:right-6 md:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5eaf5] text-xl text-[#a13ea1] sm:flex">
          <FaCookieBite />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-jost text-lg font-bold text-gray-800">Your privacy matters</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 transition hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f056f0]"
              aria-label="Close cookie preferences"
            >
              <FaTimes />
            </button>
          </div>
          <p className="mt-2 font-dm-sans text-sm leading-6 text-gray-600">
            Royal Gem Schools uses cookies and similar technologies to improve your browsing experience and understand how the website is used. You can accept or reject optional cookies.
          </p>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/privacy"
              className="font-dm-sans text-sm font-semibold text-[#a13ea1] underline underline-offset-2 hover:text-[#f056f0]"
            >
              Read our Privacy Policy
            </Link>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => saveChoice("rejected")}
                className="rounded-xl border border-gray-300 px-4 py-2.5 font-dm-sans text-sm font-semibold text-gray-600 transition hover:border-[#a13ea1] hover:text-[#a13ea1] focus:outline-none focus:ring-2 focus:ring-[#f056f0]"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => saveChoice("accepted")}
                className="rounded-xl bg-[#a13ea1] px-5 py-2.5 font-dm-sans text-sm font-semibold text-white transition hover:bg-[#7a2079] focus:outline-none focus:ring-2 focus:ring-[#f056f0]"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
