import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sendToTorusChain(content) {
  const hash = await sha256(content);
  const timestamp = new Date().toISOString();
  // MOCK: Simulate a network call and return a fake tx_id
  await new Promise(res => setTimeout(res, 1000));
  return "mock-tx-id-" + Math.random().toString(36).substring(2, 10);
}

async function verifyTorusChainTx(tx_id) {
  // Simulate checking the transaction status
  // In a real app, replace with actual API call
  // For demo, always return true after 1s
  await new Promise(res => setTimeout(res, 1000));
  return true;
}

const NoteHistory = ({ user, onAddNote }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState({}); // {note_id: true/false}
  const [confirmations, setConfirmations] = useState({}); // {note_id: true/false}
  const [search, setSearch] = useState("");

  // Fetch notes from Supabase
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setNotes(data);
      } catch (err) {
        setError(err.message || "Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [user.id]);

  // Handle blockchain verification for a note
  const handleVerify = async (note) => {
    setVerifying((v) => ({ ...v, [note.id]: true }));
    setError("");
    try {
      // 1. Compute hash and send to TorusChain
      const tx_id = await sendToTorusChain(note.content);
      // 2. Store tx_id in Supabase
      const { error: updateError } = await supabase
        .from("notes")
        .update({ tx_id })
        .eq("id", note.id);
      if (updateError) throw updateError;
      // 3. Update local state
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, tx_id } : n))
      );
      // 4. Verify transaction
      const confirmed = await verifyTorusChainTx(tx_id);
      setConfirmations((c) => ({ ...c, [note.id]: confirmed }));
    } catch (err) {
      setError(err.message || "Blockchain verification failed");
    } finally {
      setVerifying((v) => ({ ...v, [note.id]: false }));
    }
  };

  // Optionally, auto-verify notes with tx_id on mount
  useEffect(() => {
    notes.forEach((note) => {
      if (note.tx_id && confirmations[note.id] === undefined) {
        verifyTorusChainTx(note.tx_id)
          .then((confirmed) =>
            setConfirmations((c) => ({ ...c, [note.id]: confirmed }))
          )
          .catch(() =>
            setConfirmations((c) => ({ ...c, [note.id]: false }))
          );
      }
    });
    // eslint-disable-next-line
  }, [notes]);

  // Filter notes by search
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-7xl min-h-[75vh] mx-auto mt-8 p-10 bg-white rounded-3xl shadow-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Note History</h2>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="border border-gray-800 rounded px-3 py-2 w-96 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-lg"
          />
        </div>
        {error && <div className="mb-4 text-red-600">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
        {loading ? (
          <div className="text-gray-600">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-gray-500">Capture your thoughts—create your first note!</div>
        ) : (
          <div className="space-y-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-800 rounded-lg p-6 shadow flex flex-col gap-2"
              >
                <div className="font-semibold text-lg">{note.title}</div>
                <div className="text-gray-700 whitespace-pre-line">{note.content}</div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-500">
                    {note.tx_id
                      ? `Blockchain TX: ${note.tx_id}`
                      : "Not yet verified on blockchain"}
                  </span>
                  {note.tx_id && confirmations[note.id] !== undefined && (
                    <span
                      className={
                        confirmations[note.id]
                          ? "text-green-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }
                    >
                      {confirmations[note.id]
                        ? "Verified"
                        : "Pending Confirmation"}
                    </span>
                  )}
                  {!note.tx_id && (
                    <button
                      className="ml-auto bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 text-sm"
                      onClick={() => handleVerify(note)}
                      disabled={verifying[note.id]}
                    >
                      {verifying[note.id] ? "Verifying..." : "Verify on Blockchain"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Add New Note Button - bottom right */}
      <button
        className="absolute bottom-8 right-8 flex items-center gap-2 bg-indigo-50 shadow rounded-lg border border-gray-800 px-8 py-4 text-indigo-700 font-bold text-xl hover:bg-indigo-100 transition"
        onClick={onAddNote}
      >
        <span className="text-2xl">+</span> Add New Note
      </button>
    </div>
  );
};

export default NoteHistory; 