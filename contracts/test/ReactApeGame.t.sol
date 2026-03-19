// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReactApeGame.sol";

contract ReactApeGameTest is Test {
    ReactApeGame public game;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    function setUp() public {
        game = new ReactApeGame();
    }

    // ── Name Registration ───────────────────────────

    function test_registerName() public {
        vm.prank(alice);
        game.registerName("AliceApe");
        assertEq(game.hasName(alice), true);
        assertEq(keccak256(bytes(game.playerNames(alice))), keccak256(bytes("AliceApe")));
    }

    function test_registerName_reverts_empty() public {
        vm.prank(alice);
        vm.expectRevert(ReactApeGame.NameCannotBeEmpty.selector);
        game.registerName("");
    }

    function test_registerName_reverts_tooLong() public {
        vm.prank(alice);
        vm.expectRevert(ReactApeGame.NameTooLong.selector);
        game.registerName("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"); // 33 chars
    }

    // ── Score Submission ────────────────────────────

    function test_submitScore_basic() public {
        vm.prank(alice);
        game.submitScore(10);
        assertEq(game.personalBest(alice), 10);
        assertEq(game.totalScore(alice), 10);
    }

    function test_submitScore_withNameBonus() public {
        vm.prank(alice);
        game.registerName("Alice");
        vm.prank(alice);
        game.submitScore(10);
        // 10 + 1 bonus = 11
        assertEq(game.personalBest(alice), 11);
        assertEq(game.totalScore(alice), 11);
    }

    function test_submitScore_reverts_zero() public {
        vm.prank(alice);
        vm.expectRevert(ReactApeGame.ScoreMustBePositive.selector);
        game.submitScore(0);
    }

    function test_submitScore_emitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit ReactApeGame.ScoreSubmitted(alice, 10, block.timestamp);
        game.submitScore(10);
    }

    function test_submitScore_accumulates() public {
        vm.prank(alice);
        game.submitScore(10);
        vm.prank(alice);
        game.submitScore(20);
        assertEq(game.totalScore(alice), 30);
        assertEq(game.personalBest(alice), 20);

        ReactApeGame.LeaderboardEntry[] memory lb = game.getLeaderboard();
        assertEq(lb[0].score, 30);
    }

    // ── Leaderboard ────────────────────────────────

    function test_leaderboard_ordering() public {
        vm.prank(alice);
        game.submitScore(5);
        vm.prank(bob);
        game.submitScore(20);

        ReactApeGame.LeaderboardEntry[] memory lb = game.getLeaderboard();
        assertEq(lb.length, 2);
        assertEq(lb[0].player, bob);
        assertEq(lb[0].score, 20);
        assertEq(lb[1].player, alice);
        assertEq(lb[1].score, 5);
    }

    function test_leaderboard_samePlayerAccumulates() public {
        vm.prank(alice);
        game.submitScore(5);
        vm.prank(alice);
        game.submitScore(50);

        ReactApeGame.LeaderboardEntry[] memory lb = game.getLeaderboard();
        assertEq(lb.length, 1);
        assertEq(lb[0].score, 55);
    }

    function test_leaderboard_maxEntries() public {
        // Fill leaderboard with 10 entries
        for (uint256 i = 1; i <= 10; i++) {
            address player = address(uint160(i + 100));
            vm.prank(player);
            game.submitScore(i);
        }
        assertEq(game.leaderboardCount(), 10);

        // New player with top score replaces lowest
        address newPlayer = address(uint160(999));
        vm.prank(newPlayer);
        game.submitScore(100);

        ReactApeGame.LeaderboardEntry[] memory lb = game.getLeaderboard();
        assertEq(lb[0].player, newPlayer);
        assertEq(lb[0].score, 100);
    }
}
