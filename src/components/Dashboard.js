import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import CreateNote from "./CreateNote";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white/80 rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-4">Welcome, {user.email}!</h1>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md mb-6 shadow transition-all duration-300"
          onClick={handleLogout}
        >
          Logout
        </button>
        {!showCreate ? (
          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow text-xl font-semibold"
            onClick={() => setShowCreate(true)}
          >
            Start your notes
          </button>
        ) : (
          <CreateNote user={user} onBack={() => setShowCreate(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;