import { VRFHelper } from "./VRF-helper.mjs";
import { getParticipantsFileHash, pickAllRaffleWinners, assignRangesToUsers } from "./utils.mjs";
import fs from 'fs';
import { toBigInt } from 'ethers';
import logger from './logger.mjs';



async function main() {

    const snapshotHash = getParticipantsFileHash('./data/snapshot.json');
    const ranges = assignRangesToUsers('./data/snapshot.json');
    fs.writeFileSync('ranges.json',JSON.stringify(ranges));

    const contract = new VRFHelper(
        'https://api.avax-test.network/ext/bc/C/rpc',
        '', // Be sure to keep your private key secure!
        '0x9b10a7a745eDD7317c0b173D5F63Da639E25C89C',
        './contractABI.json'
    );

    try {
        const requestId = await contract.rollDice(snapshotHash);
        const result = await contract.checkRollFinalization(requestId);
        logger.info(`Dice Result :  ${result}`);
        pickAllRaffleWinners(ranges, result,'winners-test.json');

    } catch (error) {
        console.error("Error in main:", error);
    }


}

main();