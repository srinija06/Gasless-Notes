import React, { useState, useEffect } from 'react';
import TorusChainClient from '../utils/torusChainClient';
import { generateNoteHash } from '../utils/hashUtils';

const NoteVerifier = ({ note, onVerificationComplete }) => {
    const [status, setStatus] = useState('idle'); // idle, verifying, success, error
    const [error, setError] = useState(null);
    const [client, setClient] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initializeClient = async () => {
            try {
                setIsInitializing(true);
                // Local Hardhat network contract address
                const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
                const torusClient = new TorusChainClient(contractAddress);
                await torusClient.initialize();
                setClient(torusClient);
                setError(null);
            } catch (err) {
                console.error('Initialization error:', err);
                setError('Failed to initialize blockchain client. Please make sure MetaMask is installed and connected to the local network.');
                setStatus('error');
            } finally {
                setIsInitializing(false);
            }
        };

        initializeClient();

        // Cleanup function to handle unmounting
        return () => {
            if (client) {
                client.contract?.removeAllListeners();
            }
        };
    }, []);

    const verifyNote = async () => {
        if (!client || !note) return;

        try {
            setStatus('verifying');
            setError(null);

            // Generate hash from note content
            const noteHash = generateNoteHash(note.content);

            // Check if note is already verified
            const isVerified = await client.isNoteVerified(noteHash);
            if (isVerified) {
                setError('Note is already verified on the blockchain');
                setStatus('error');
                return;
            }

            // Verify note on blockchain
            const tx = await client.verifyNote(noteHash);
            
            // Set up event listener for verification
            client.onNoteVerified((hash, owner) => {
                if (hash === noteHash) {
                    setStatus('success');
                    if (onVerificationComplete) {
                        onVerificationComplete({
                            hash: noteHash,
                            owner,
                            transactionHash: tx.transactionHash
                        });
                    }
                }
            });

        } catch (err) {
            console.error('Verification error:', err);
            let errorMessage = 'Failed to verify note. ';
            
            if (err.message.includes('network')) {
                errorMessage += 'Please make sure you are connected to the local Hardhat network (Chain ID: 31337).';
            } else if (err.message.includes('rejected')) {
                errorMessage += 'Transaction was rejected. Please try again.';
            } else {
                errorMessage += err.message;
            }
            
            setError(errorMessage);
            setStatus('error');
        }
    };

    const getStatusMessage = () => {
        if (isInitializing) return 'Initializing blockchain connection...';
        
        switch (status) {
            case 'verifying':
                return 'Verifying note on blockchain...';
            case 'success':
                return 'Note successfully verified!';
            case 'error':
                return error || 'An error occurred';
            default:
                return 'Ready to verify';
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Note Verification</h3>
            
            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                        {getStatusMessage()}
                    </span>
                </p>
            </div>

            {status === 'error' && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                    {error}
                </div>
            )}

            <button
                onClick={verifyNote}
                disabled={!client || status === 'verifying' || isInitializing}
                className={`w-full py-2 px-4 rounded font-medium ${
                    !client || status === 'verifying' || isInitializing
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
                {isInitializing ? 'Initializing...' : status === 'verifying' ? 'Verifying...' : 'Verify Note'}
            </button>

            {isInitializing && (
                <p className="mt-2 text-sm text-gray-500 text-center">
                    Please make sure MetaMask is installed and connected to the local Hardhat network
                </p>
            )}
        </div>
    );
};

export default NoteVerifier; 