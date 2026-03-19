// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ReactApeGame.sol";

contract DeployReactApeGame is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ReactApeGame game = new ReactApeGame();
        console.log("ReactApeGame deployed to:", address(game));

        vm.stopBroadcast();
    }
}
