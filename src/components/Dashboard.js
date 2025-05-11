import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import CreateNote from "./CreateNote";

const Dashboard = () => {
  const [user, setUser] = useState(null);
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

  // Get initial from email
  const emailInitial = user.email ? user.email[0].toUpperCase() : "?";
  const userName = user.user_metadata?.name || user.email;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-80 bg-white shadow-lg flex flex-col justify-between items-center py-8 z-30">
        {/* Top: Profile section */}
        <div className="w-full">
          <div className="flex items-center mb-10 w-full px-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {emailInitial}
            </div>
            <span className="ml-2 text-lg font-semibold truncate">{userName}</span>
          </div>
        </div>
        {/* Bottom: Settings */}
        <div className="w-full flex flex-col items-center z-20 mb-2">
          <div className="bg-white rounded-lg shadow-lg px-6 py-3 flex flex-col items-center w-full">
            <button
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 focus:outline-none text-xl font-bold w-full justify-center"
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <span className="text-2xl">⚙️</span>
              <span className="font-bold text-xl">Settings</span>
            </button>
            {settingsOpen && (
              <div className="mt-8 w-full bg-white border rounded shadow-lg z-30">
                <button
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-base"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center ml-80 min-h-screen overflow-y-auto">
        <div className="w-full max-w-3xl p-12">
          <CreateNote user={user} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;