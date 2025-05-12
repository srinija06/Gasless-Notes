import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import NoteVerifier from './NoteVerifier';

const CreateNote = ({ user, onBack }) => {
  const [note, setNote] = useState({ title: '', content: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
  };

  const handleVerificationComplete = async (data) => {
    setVerificationData(data);
    setIsVerifying(false);
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('notes')
        .insert([{
          title: note.title,
          content: note.content,
          user_id: user.id,
          hash: data.hash,
          transaction_hash: data.transactionHash,
          verified_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      // Wait a brief moment to ensure the note is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      onBack(); // Return to notes list
    } catch (err) {
      console.error('Failed to save note:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="w-[90vw] h-[85vh] mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Notes
          </button>
          <h2 className="text-3xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">Create New Note</h2>
        </div>

        <div className="flex-1 flex flex-col">
          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={note.title}
                onChange={(e) => setNote({ ...note, title: e.target.value })}
                className="mt-1 block w-full h-14 rounded-md border-2 border-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg px-4"
                required
              />
            </div>

            <div className="flex-1">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                rows={12}
                value={note.content}
                onChange={(e) => setNote({ ...note, content: e.target.value })}
                className="mt-1 block w-full rounded-md border-2 border-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || isSaving}
              className={`w-full flex justify-center py-3 px-4 border-2 rounded-md shadow-sm text-sm font-medium text-white ${
                isVerifying || isSaving
                  ? 'bg-gray-400 border-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 border-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isSaving ? 'Saving Note...' : isVerifying ? 'Verifying...' : 'Save Note'}
            </button>
          </form>

          {isVerifying && (
            <div className="mt-6 border-2 border-gray-800 rounded-xl p-6 bg-white">
              <NoteVerifier
                note={note}
                onVerificationComplete={handleVerificationComplete}
              />
            </div>
          )}

          {verificationData && !isSaving && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-600 rounded-xl">
              <h3 className="text-lg font-medium text-green-800">Note Verified Successfully!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Transaction Hash: {verificationData.transactionHash}</p>
                <p>Note Hash: {verificationData.hash}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateNote; 