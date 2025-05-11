import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

const googleIcon = (
  <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_17_40)">
      <path d="M47.5 24.5C47.5 22.5 47.3 20.7 47 19H24V29H37.5C37 31.5 35.5 34 33 35.7V41.2H40.5C44.5 37.5 47.5 31.7 47.5 24.5Z" fill="#4285F4"/>
      <path d="M24 48C30.5 48 35.8 45.8 39.5 41.2L33 35.7C31.1 37.1 28.8 38 26 38C20.7 38 16.1 34.2 14.5 29.5H7.7V35.1C11.4 42.1 17.2 48 24 48Z" fill="#34A853"/>
      <path d="M14.5 29.5C13.9 27.9 13.5 26.1 13.5 24C13.5 21.9 13.9 20.1 14.5 18.5V12.9H7.7C5.7 16.7 4.5 20.7 4.5 24C4.5 27.3 5.7 31.3 7.7 35.1L14.5 29.5Z" fill="#FBBC05"/>
      <path d="M24 10C27.1 10 29.8 11.1 31.7 13L39.7 5C35.8 1.4 30.5 0 24 0C17.2 0 11.4 5.9 7.7 12.9L14.5 18.5C16.1 13.8 20.7 10 24 10Z" fill="#EA4335"/>
    </g>
    <defs>
      <clipPath id="clip0_17_40">
        <rect width="48" height="48" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const Login = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false);
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(false);
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      console.error("Login error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      {/* Glassmorphism effect behind the title */}
      <div className="backdrop-blur-lg bg-white/30 rounded-3xl px-12 py-8 shadow-2xl mb-16 flex flex-col items-center min-h-[28rem]">
        <div className="flex items-center gap-8 mb-8">
          {/* Large SVG icon */}
          <span className="inline-block align-middle">
            <svg width="160" height="160" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="8" width="36" height="44" rx="6" fill="#fff" stroke="#6366f1" strokeWidth="4"/>
              <rect x="12" y="14" width="4" height="8" rx="2" fill="#6366f1"/>
              <rect x="12" y="26" width="4" height="8" rx="2" fill="#6366f1"/>
              <rect x="12" y="38" width="4" height="8" rx="2" fill="#6366f1"/>
              <path d="M32 24L48 40" stroke="#f59e42" strokeWidth="4" strokeLinecap="round"/>
              <rect x="41" y="33" width="10" height="6" rx="2" transform="rotate(45 41 33)" fill="#f59e42"/>
            </svg>
          </span>
          {/* Gradient text */}
          <span className="text-[7rem] font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent select-none">
            Gasless Notes
          </span>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-100 hover:bg-blue-200 border border-blue-200 flex items-center gap-2 px-8 py-4 rounded-md shadow-md transition-all duration-300 text-2xl font-semibold hover:scale-105 transform mt-4 text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900"></div>
          ) : (
            googleIcon
          )}
          <span>{loading ? 'Logging in...' : 'Login with Google'}</span>
        </button>
      </div>
    </div>
  );
};

export default Login;