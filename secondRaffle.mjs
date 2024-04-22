import { VRFHelper } from "./VRF-helper.mjs";
import { getParticipantsFileHash, assignRangesToUsers, pickAllRaffleWinnersForTheSecondRaffle} from "./utils.mjs";
import logger from './logger.mjs';
import fs from 'fs';

async function main() {

    const snapshotHash = getParticipantsFileHash('./data/filtered_second_raffle_snapshot.json');
    const ranges = assignRangesToUsers('./data/filtered_second_raffle_snapshot.json');
    fs.writeFileSync('secondRaffleRanges.json',JSON.stringify(ranges));

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
        pickAllRaffleWinnersForTheSecondRaffle(ranges,result,'secondRaffleWinner.json');

    } catch (error) {
        console.error("Error in main:", error);
    }

}



main();