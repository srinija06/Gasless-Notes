import { ethers } from 'ethers';
import { hexToBytes32 } from './hashUtils';

// Contract ABI - only including the functions we need
const CONTRACT_ABI = [
    "function verifyNote(bytes32 noteHash) public",
    "function updateNote(bytes32 oldNoteHash, bytes32 newNoteHash) public",
    "function isNoteVerified(bytes32 noteHash) public view returns (bool)",
    "function getNoteOwner(bytes32 noteHash) public view returns (address)",
    "event NoteVerified(bytes32 indexed noteHash, address indexed owner)",
    "event NoteUpdated(bytes32 indexed noteHash, address indexed owner)"
];

// Local Hardhat Network configuration
const LOCAL_NETWORK = {
    chainId: '0x7A69', // 31337 in hex
    chainName: 'Hardhat Local',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['http://127.0.0.1:8545']
};

class TorusChainClient {
    constructor(contractAddress) {
        this.contractAddress = contractAddress;
        this.provider = null;
        this.signer = null;
        this.contract = null;
    }

    async initialize() {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Add and switch to local network
            await this.setupLocalNetwork();

            this.signer = this.provider.getSigner();
            this.contract = new ethers.Contract(
                this.contractAddress,
                CONTRACT_ABI,
                this.signer
            );

            // Set up network change listener
            window.ethereum.on('chainChanged', (chainId) => {
                if (chainId !== LOCAL_NETWORK.chainId) {
                    this.setupLocalNetwork();
                }
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize blockchain client:', error);
            throw error;
        }
    }

    async setupLocalNetwork() {
        try {
            // Try to switch to the local network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: LOCAL_NETWORK.chainId }],
            });
        } catch (switchError) {
            // This error code means the chain hasn't been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [LOCAL_NETWORK],
                    });
                } catch (addError) {
                    throw new Error('Failed to add local network to MetaMask: ' + addError.message);
                }
            } else {
                throw new Error('Failed to switch to local network: ' + switchError.message);
            }
        }
    }

    async verifyNote(noteHash) {
        if (!this.contract) {
            throw new Error('Client not initialized');
        }

        // Ensure we're on the correct network
        await this.setupLocalNetwork();

        const bytes32Hash = hexToBytes32(noteHash);
        const tx = await this.contract.verifyNote(bytes32Hash);
        return await tx.wait();
    }

    async updateNote(oldNoteHash, newNoteHash) {
        if (!this.contract) {
            throw new Error('Client not initialized');
        }

        // Ensure we're on the correct network
        await this.setupLocalNetwork();

        const oldBytes32Hash = hexToBytes32(oldNoteHash);
        const newBytes32Hash = hexToBytes32(newNoteHash);
        const tx = await this.contract.updateNote(oldBytes32Hash, newBytes32Hash);
        return await tx.wait();
    }

    async isNoteVerified(noteHash) {
        if (!this.contract) {
            throw new Error('Client not initialized');
        }

        // Ensure we're on the correct network
        await this.setupLocalNetwork();

        const bytes32Hash = hexToBytes32(noteHash);
        return await this.contract.isNoteVerified(bytes32Hash);
    }

    async getNoteOwner(noteHash) {
        if (!this.contract) {
            throw new Error('Client not initialized');
        }

        // Ensure we're on the correct network
        await this.setupLocalNetwork();

        const bytes32Hash = hexToBytes32(noteHash);
        return await this.contract.getNoteOwner(bytes32Hash);
    }

    // Event listeners
    onNoteVerified(callback) {
        if (!this.contract) {
            throw new Error('Client not initialized');
        }
        this.contract.on('NoteVerified', callback);
    }

    onNoteUpdated(callback) {
        if (!this.contract) {
            throw new Error('Client not initialized');
        }
        this.contract.on('NoteUpdated', callback);
    }
}

export default TorusChainClient; 