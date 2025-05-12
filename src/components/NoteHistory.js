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

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    <div className="w-[90vw] h-[85vh] mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 h-full flex flex-col relative border-2 border-gray-800">
        {/* Header with Search */}
        <div className="mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Notes</h2>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full px-4 py-2 border-2 border-gray-800 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Notes List with Scroll */}
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <svg className="h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-500">Get started by creating your first note.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-16 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {filteredNotes.map((note) => (
              <div key={note.id} className="border-2 border-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-medium text-gray-900">{note.title}</h3>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 block">{formatDate(note.created_at)}</span>
                    {note.verified_at && (
                      <span className="text-xs text-gray-400 block">
                        Verified: {formatDate(note.verified_at)}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>
                {note.verified_at && (
                  <div className="flex items-center text-sm text-green-600 mb-2">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified on blockchain
                  </div>
                )}
                {note.transaction_hash && (
                  <div className="text-xs text-gray-500">
                    TX: {note.transaction_hash.slice(0, 10)}...{note.transaction_hash.slice(-8)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Note Button - Fixed to bottom right */}
        <button
          onClick={onAddNote}
          className="absolute bottom-6 right-6 inline-flex items-center px-6 py-3 border-2 border-gray-800 rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Note
        </button>
      </div>
    </div>
  );
};

export default NoteHistory; 