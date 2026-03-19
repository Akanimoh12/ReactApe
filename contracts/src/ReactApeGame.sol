// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReactApeGame — On-chain score registry for the ReactApe arcade game
/// @notice Players submit scores after each game session.
///         Registered players who set a display name receive a x1 bonus multiplier.
///         The contract maintains a simple top-10 leaderboard updated on every submission.
/// @dev Deployed on Somnia Testnet (chainId 50312).
///      Somnia Reactivity off-chain subscriptions listen to ScoreSubmitted events
///      so the frontend leaderboard updates in real-time without polling.

contract ReactApeGame {
    // ──────────────────── Errors ────────────────────
    error ScoreMustBePositive();
    error NameTooLong();
    error NameCannotBeEmpty();

    // ──────────────────── Events ────────────────────
    /// @notice Emitted every time a player submits a score (after bonus applied).
    event ScoreSubmitted(address indexed player, uint256 score, uint256 timestamp);

    /// @notice Emitted when a player registers or updates their display name.
    event NameRegistered(address indexed player, string name);

    // ──────────────────── Types ─────────────────────
    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    // ──────────────────── Constants ─────────────────
    uint256 public constant MAX_LEADERBOARD = 10;
    uint256 public constant NAME_BONUS_MULTIPLIER = 1; // x1 bonus points
    uint256 public constant MAX_NAME_LENGTH = 32;

    // ──────────────────── Storage ───────────────────
    /// @notice Display names opted-in by players.
    mapping(address => string) public playerNames;

    /// @notice Whether an address has registered a name.
    mapping(address => bool) public hasName;

    /// @notice Best single-round score per player.
    mapping(address => uint256) public personalBest;

    /// @notice Accumulated total score across all sessions.
    mapping(address => uint256) public totalScore;

    /// @notice On-chain top-10 leaderboard (sorted descending by score).
    LeaderboardEntry[10] public leaderboard;

    /// @notice Current number of valid entries in the leaderboard (≤ 10).
    uint256 public leaderboardCount;

    // ──────────────────── Name Registration ─────────
    /// @notice Register or update a display name.
    ///         Players with a name get a x1 point bonus on every score submission.
    /// @param _name The display name (1-32 UTF-8 bytes).
    function registerName(string calldata _name) external {
        bytes memory nameBytes = bytes(_name);
        if (nameBytes.length == 0) revert NameCannotBeEmpty();
        if (nameBytes.length > MAX_NAME_LENGTH) revert NameTooLong();

        playerNames[msg.sender] = _name;
        hasName[msg.sender] = true;

        emit NameRegistered(msg.sender, _name);
    }

    // ──────────────────── Score Submission ───────────
    /// @notice Submit a game score. If the sender has a registered name,
    ///         a x1 bonus is added to the score. Emits ScoreSubmitted for
    ///         Somnia Reactivity off-chain subscribers.
    /// @param _score Raw score from the game client (must be > 0).
    function submitScore(uint256 _score) external {
        if (_score == 0) revert ScoreMustBePositive();

        uint256 roundScore = _score;
        if (hasName[msg.sender]) {
            roundScore += NAME_BONUS_MULTIPLIER;
        }

        if (roundScore > personalBest[msg.sender]) {
            personalBest[msg.sender] = roundScore;
        }

        totalScore[msg.sender] += roundScore;
        uint256 accumulated = totalScore[msg.sender];

        _updateLeaderboard(msg.sender, accumulated);

        emit ScoreSubmitted(msg.sender, accumulated, block.timestamp);
    }

    // ──────────────────── Views ─────────────────────
    /// @notice Return the full top-10 leaderboard.
    function getLeaderboard() external view returns (LeaderboardEntry[] memory) {
        uint256 count = leaderboardCount;
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](count);
        for (uint256 i = 0; i < count; i++) {
            entries[i] = leaderboard[i];
        }
        return entries;
    }

    /// @notice Convenience: return display name for a player (empty string if none).
    function getPlayerName(address _player) external view returns (string memory) {
        return playerNames[_player];
    }

    // ──────────────────── Internal ──────────────────
    /// @dev Insert-sort the new entry into the leaderboard (descending by score).
    ///      Each player can only appear once; if they already exist, update in-place
    ///      and re-sort. Worst-case O(10) — constant and cheap.
    function _updateLeaderboard(address _player, uint256 _score) internal {
        uint256 count = leaderboardCount;
        uint256 existingIdx = type(uint256).max;

        // Check if player already on leaderboard
        for (uint256 i = 0; i < count; i++) {
            if (leaderboard[i].player == _player) {
                existingIdx = i;
                break;
            }
        }

        if (existingIdx != type(uint256).max) {
            // Player exists — only update if new score is higher
            if (_score <= leaderboard[existingIdx].score) return;
            leaderboard[existingIdx].score = _score;
            leaderboard[existingIdx].timestamp = block.timestamp;
            // Bubble up
            _bubbleUp(existingIdx);
        } else if (count < MAX_LEADERBOARD) {
            // Board not full — append and bubble up
            leaderboard[count] = LeaderboardEntry(_player, _score, block.timestamp);
            leaderboardCount = count + 1;
            _bubbleUp(count);
        } else if (_score > leaderboard[MAX_LEADERBOARD - 1].score) {
            // Board full — replace last entry if score qualifies
            leaderboard[MAX_LEADERBOARD - 1] = LeaderboardEntry(_player, _score, block.timestamp);
            _bubbleUp(MAX_LEADERBOARD - 1);
        }
    }

    /// @dev Bubble an entry upward in the sorted array while its score
    ///      exceeds the entry above it.
    function _bubbleUp(uint256 idx) internal {
        while (idx > 0 && leaderboard[idx].score > leaderboard[idx - 1].score) {
            LeaderboardEntry memory tmp = leaderboard[idx - 1];
            leaderboard[idx - 1] = leaderboard[idx];
            leaderboard[idx] = tmp;
            idx--;
        }
    }
}
