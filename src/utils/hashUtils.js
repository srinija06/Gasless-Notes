import CryptoJS from 'crypto-js';

/**
 * Generates a SHA-256 hash of the note content
 * @param {string} content - The note content to hash
 * @returns {string} The hex string of the hash
 */
export const generateNoteHash = (content) => {
    // Convert the content to SHA-256 hash
    const hash = CryptoJS.SHA256(content);
    // Get the hex string representation
    return '0x' + hash.toString(CryptoJS.enc.Hex);
};

/**
 * Converts a hex string to bytes32 format for smart contract interaction
 * @param {string} hexString - The hex string (with or without 0x prefix)
 * @returns {string} The bytes32 representation
 */
export const hexToBytes32 = (hexString) => {
    // Remove 0x prefix if present
    const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
    // Pad to 64 characters (32 bytes)
    return '0x' + cleanHex.padStart(64, '0');
};

/**
 * Validates if a string is a valid hex string
 * @param {string} hexString - The string to validate
 * @returns {boolean} True if valid hex string
 */
export const isValidHex = (hexString) => {
    const hexRegex = /^0x[0-9a-fA-F]{64}$/;
    return hexRegex.test(hexString);
}; 