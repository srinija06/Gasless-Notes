import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import CreateNote from "./CreateNote";
import NoteHistory from "./NoteHistory";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  if (!user) return <div>Loading...</div>;

  // Get initials from email
  const initials = user.email
    ? user.email
        .split("@")[0]
        .split(/[._]/)
        .map((s) => s[0]?.toUpperCase())
        .join("")
    : "?";
  const userName = user.user_metadata?.name || user.email;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-24 bg-white shadow flex items-center justify-between px-12 z-40">
        <div className="flex items-center gap-4">
          {/* SVG Icon */}
          <span className="inline-block align-middle">
            <svg width="48" height="48" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="8" width="36" height="44" rx="6" fill="#fff" stroke="#6366f1" strokeWidth="4"/>
              <rect x="12" y="14" width="4" height="8" rx="2" fill="#6366f1"/>
              <rect x="12" y="26" width="4" height="8" rx="2" fill="#6366f1"/>
              <rect x="12" y="38" width="4" height="8" rx="2" fill="#6366f1"/>
              <path d="M32 24L48 40" stroke="#f59e42" strokeWidth="4" strokeLinecap="round"/>
              <rect x="41" y="33" width="10" height="6" rx="2" transform="rotate(45 41 33)" fill="#f59e42"/>
            </svg>
          </span>
          {/* Gradient Text */}
          <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent select-none">
            Gasless Notes
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Settings */}
          <div className="relative">
            <button
              className="text-2xl text-gray-600 hover:text-indigo-700 focus:outline-none"
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <span role="img" aria-label="settings">⚙️</span>
            </button>
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => alert('Help coming soon!')}
                >
                  Help
                </button>
              </div>
            )}
          </div>
          {/* Profile Initial (far right) */}
          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-lg font-bold">
            {initials}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-28 flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto" style={{minHeight:'calc(100vh - 7rem)'}}>
        {showCreate ? (
          <CreateNote user={user} onBack={() => setShowCreate(false)} />
        ) : (
          <NoteHistory user={user} onAddNote={() => setShowCreate(true)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;