import React, { useState } from "react";
import { HiOutlineLogin, HiOutlineUserAdd } from "react-icons/hi";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { StudentLoginForm } from "./StudentLoginForm";
import { StudentRegisterForm } from "./StudentRegisterForm";
import sqLogo from '../assets/xQuesty_logo.png';

// Reusable tiny logo+wordmark for branding
function ModalBranding() {
  return (
    <div className="flex flex-col items-center justify-center pt-6 pb-2">
      <img
        src={sqLogo}
        alt="StageQuest Logo"
        className="h-12 w-auto"
      />
      <span className="text-xl font-extrabold text-blue-900 tracking-tight mt-2">xQuesty</span>
    </div>
  );
}

export default function StudentAccess() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formType, setFormType] = useState("login");

  const mobileFullscreen = (typeof window !== "undefined" && window.innerWidth < 640);

  function handleOpenModal(type) {
    setFormType(type);
    setModalOpen(true);
  }

  function handleSwitch(type) {
    setFormType(type);
  }

  function handleClose() {
    setModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 pt-28 pb-16 flex flex-col items-center justify-center min-h-[70vh]">
        {/* Branding ABOVE the login/register box */}
        <ModalBranding />
        <motion.div
          className="w-full max-w-2xl flex flex-col md:flex-row rounded-2xl shadow-2xl bg-white bg-opacity-95 dark:bg-slate-900 dark:bg-opacity-90 p-8 gap-8 backdrop-blur-sm mt-2"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Info section */}
          <section className="flex-1 flex flex-col justify-center mb-8 md:mb-0">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Student Access</h1>
            <p className="text-gray-700 dark:text-slate-300 text-base mb-4">
              This portal is exclusively for students. Please log in or register to access your dashboard and manage your internship applications.
            </p>
            <div className="mt-5 flex justify-center md:justify-start">
              <svg width={80} height={38} viewBox="0 0 66 38" fill="none">
                <rect x="8" y="8" width="50" height="22" rx="7" fill="#2563eb" opacity="0.14"/>
                <rect x="0" y="0" width="33" height="10" rx="5" fill="#a5b4fc" opacity="0.18"/>
                <rect x="34" y="28" width="32" height="10" rx="5" fill="#60a5fa" opacity="0.18"/>
              </svg>
            </div>
          </section>
          {/* Actions */}
          <section className="flex-1 flex flex-col justify-center items-center gap-6 w-full">
            <Button
              size="lg"
              className="w-full flex justify-center gap-2"
              onClick={() => handleOpenModal("login")}
              aria-haspopup="dialog"
              aria-controls="student-dialog"
            >
              <HiOutlineLogin className="w-6 h-6" />
              Login
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full flex justify-center gap-2"
              onClick={() => handleOpenModal("register")}
              aria-haspopup="dialog"
              aria-controls="student-dialog"
            >
              <HiOutlineUserAdd className="w-6 h-6" />
              Register
            </Button>
          </section>
        </motion.div>
      </main>
      <Dialog
        open={modalOpen}
        onClose={handleClose}
        mobileFullscreen={mobileFullscreen}
        id="student-dialog"
      >
        <ModalBranding />
        <h2 className="text-2xl font-bold text-center mb-2">
          {formType === "login" ? "Student Login" : "Student Registration"}
        </h2>
        {formType === "login" ? (
          <StudentLoginForm 
            onSwitchForm={handleSwitch}
            onClose={handleClose}
          />
        ) : (
          <StudentRegisterForm
            onSwitchForm={handleSwitch}
            onClose={handleClose}
          />
        )}
      </Dialog>
    </div>
  );
}
