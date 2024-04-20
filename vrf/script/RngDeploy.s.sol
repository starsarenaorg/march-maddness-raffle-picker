// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {RNG} from "../src/RNG.sol";

contract RNGScript is Script {
    bytes32 fujiKeyHash = 0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61;
    address fujiCoordinator = 0x2eD832Ba664535e5886b75D64C46EB9a228C2610;
    uint64 fujiSubsId = 532;

    bytes32 avalancheKeyHash = 0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d;
    address avalancheCoordinator = 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634;
    uint64 avalancheSubsId = 181;


    function setUp() public {}

    function run() public {
        vm.broadcast();
        //RNG x = new RNG(fujiSubsId,fujiCoordinator,fujiKeyHash);
        RNG x = new RNG(avalancheSubsId,avalancheCoordinator,avalancheKeyHash);


    }
}
