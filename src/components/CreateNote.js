import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const CreateNote = ({ user, onBack }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // 1. Store note in Supabase
      const { error: supabaseError } = await supabase
        .from("notes")
        .insert([{ title, content, user_id: user?.id }]);
      if (supabaseError) throw supabaseError;

      // 2. Compute SHA-256 hash
      const hash = await sha256(content);
      const timestamp = new Date().toISOString();

      // 3. MOCK: Simulate sending to TorusChain
      await new Promise(res => setTimeout(res, 1000));
      // Optionally, you could set a fake tx_id in Supabase here

      setSuccess("Note saved and proof submitted successfully!");
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-7xl min-h-[75vh] h-full mx-auto mt-8 p-10 bg-white rounded-3xl shadow-2xl flex flex-col justify-between">
      <h2 className="text-2xl font-bold mb-6">Create a Note</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <input
        className="w-full border border-gray-800 rounded px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={loading}
      />
      <textarea
        className="w-full border border-gray-800 rounded px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={8}
        style={{ minHeight: '120px', maxHeight: '180px', overflowY: 'auto' }}
        disabled={loading}
      />
      <button
        className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded hover:bg-indigo-700 transition disabled:opacity-50 text-lg"
        onClick={handleSave}
        disabled={loading || !title || !content}
      >
        {loading ? "Saving..." : "Save Note"}
      </button>
      {onBack && (
        <button
          className="w-full mt-4 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-300 transition"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </button>
      )}
    </div>
  );
};

export default CreateNote; 