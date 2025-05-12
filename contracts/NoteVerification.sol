// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract NoteVerification {
    mapping(bytes32 => bool) public verifiedNotes;
    mapping(bytes32 => address) public noteOwners;
    
    event NoteVerified(bytes32 indexed noteHash, address indexed owner);
    event NoteUpdated(bytes32 indexed noteHash, address indexed owner);

    function verifyNote(bytes32 noteHash) public {
        require(!verifiedNotes[noteHash], "Note already verified");
        verifiedNotes[noteHash] = true;
        noteOwners[noteHash] = msg.sender;
        emit NoteVerified(noteHash, msg.sender);
    }

    function updateNote(bytes32 oldNoteHash, bytes32 newNoteHash) public {
        require(verifiedNotes[oldNoteHash], "Original note not found");
        require(noteOwners[oldNoteHash] == msg.sender, "Not the note owner");
        require(!verifiedNotes[newNoteHash], "New note hash already exists");

        verifiedNotes[oldNoteHash] = false;
        verifiedNotes[newNoteHash] = true;
        noteOwners[newNoteHash] = msg.sender;
        delete noteOwners[oldNoteHash];

        emit NoteUpdated(newNoteHash, msg.sender);
    }

    function isNoteVerified(bytes32 noteHash) public view returns (bool) {
        return verifiedNotes[noteHash];
    }

    function getNoteOwner(bytes32 noteHash) public view returns (address) {
        return noteOwners[noteHash];
    }
} 