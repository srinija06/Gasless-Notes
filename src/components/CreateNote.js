import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import NoteVerifier from './NoteVerifier';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const CreateNote = ({ user, onBack }) => {
  const [note, setNote] = useState({ title: '', content: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
  };

  const handleVerificationComplete = async (data) => {
    setVerificationData(data);
    setIsVerifying(false);
    
    // Here you would typically save the note and verification data to your database
    // For example, using Supabase:
    /*
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: note.title,
          content: note.content,
          user_id: user.id,
          hash: data.hash,
          transaction_hash: data.transactionHash,
          verified_at: new Date().toISOString()
        }]);

      if (error) throw error;
      onBack(); // Return to notes list
    } catch (err) {
      console.error('Failed to save note:', err);
    }
    */
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Notes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            rows={8}
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isVerifying
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isVerifying ? 'Creating Note...' : 'Create Note'}
        </button>
      </form>

      {isVerifying && (
        <div className="mt-6">
          <NoteVerifier
            note={note}
            onVerificationComplete={handleVerificationComplete}
          />
        </div>
      )}

      {verificationData && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium text-green-800">Note Verified Successfully!</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>Transaction Hash: {verificationData.transactionHash}</p>
            <p>Note Hash: {verificationData.hash}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateNote; 