import { VRFHelper } from "./VRF-helper.mjs";
import { getParticipantsFileHash, pickAllRaffleWinners, assignRangesToUsers,pickAllRaffleWinnersForTheSecondRaffle } from "./utils.mjs";

const contract = new VRFHelper(
    'https://api.avax.network/ext/bc/C/rpc',
    '', // Be sure to keep your private key secure!
    '0x847B953fE0D759011dF7Bc89d5700d757eC73Efa',
    './contractABI.json'
);

async function verifyRaffle(snapshotFilePath, originalWinnersPath, verificationWinnersPath) {
    const ranges = assignRangesToUsers(snapshotFilePath);
    const snapshotHash = getParticipantsFileHash(snapshotFilePath);
    console.log(`Snapshot hash ${snapshotHash}`);
    const result = await contract.getResultForSnapshotHash(snapshotHash);
    console.log(`Random number : ${result}`);
    pickAllRaffleWinners(ranges, result, verificationWinnersPath);
    const originalWinners = getParticipantsFileHash(verificationWinnersPath);
    const verifiedWinners = getParticipantsFileHash(originalWinnersPath);
    const verified = originalWinners === verifiedWinners;
    if (verified) {
        console.log('Verification succesfull! The exact same result has been succesfully reconstructed!')
    }
    else {
        console.log('Verification failed!')
    }
}

async function verifySecondRaffle(snapshotFilePath, originalWinnersPath, verificationWinnersPath) {
    const ranges = assignRangesToUsers(snapshotFilePath);
    const snapshotHash = getParticipantsFileHash(snapshotFilePath);
    console.log(`Snapshot hash ${snapshotHash}`);
    const result = await contract.getResultForSnapshotHash(snapshotHash);
    console.log(`Random number : ${result}`);
    pickAllRaffleWinnersForTheSecondRaffle(ranges, result, verificationWinnersPath);
    const originalWinners = getParticipantsFileHash(verificationWinnersPath);
    const verifiedWinners = getParticipantsFileHash(originalWinnersPath);
    const verified = originalWinners === verifiedWinners;
    if (verified) {
        console.log('Verification succesfull! The exact same result has been succesfully reconstructed!')
    }
    else {
        console.log('Verification failed!')
    }
}


console.log('Verification for the first raffle: ');
await verifyRaffle('./data/snapshot.json', 'winner.json', 'winnersForVerification.json');
console.log('Verification for the second raffle: ');
await verifySecondRaffle('./data/filtered_second_raffle_snapshot.json', 'secondRaffleWinner.json', 'winnersForVerificationRaffle2.json');




