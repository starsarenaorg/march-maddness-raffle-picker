import { VRFHelper } from "./VRF-helper.mjs";
import { getParticipantsFileHash, assignRangesToUsers, pickAllRaffleWinners} from "./utils.mjs";
import logger from './logger.mjs';
import fs from 'fs';

async function main() {

    const snapshotHash = getParticipantsFileHash('./data/snapshot.json');
    const ranges = assignRangesToUsers('./data/snapshot.json');
    fs.writeFileSync('ranges.json',JSON.stringify(ranges));

    const contract = new VRFHelper(
        'https://api.avax.network/ext/bc/C/rpc',
        '', // Be sure to keep your private key secure!
        '0x847B953fE0D759011dF7Bc89d5700d757eC73Efa',
        './contractABI.json'
    );

    try {
        const requestId = await contract.rollDice(snapshotHash);
        const result = await contract.checkRollFinalization(requestId);
        logger.info(`Dice Result :  ${result}`);
        pickAllRaffleWinners(ranges,result,'winner.json');

    } catch (error) {
        console.error("Error in main:", error);
    }

}



main();