import { VRFHelper } from "./VRF-helper.mjs";
import { getParticipantsFileHash, pickAllRaffleWinners,assignRangesToUsers } from "./utils.mjs";

const contract = new VRFHelper(
    'https://api.avax-test.network/ext/bc/C/rpc',
    null, // no need for a private key for read only
    '0x847B953fE0D759011dF7Bc89d5700d757eC73Efa',
    './contractABI.json'
);
const ranges = assignRangesToUsers('./data/snapshot.json');
const snapshotHash = getParticipantsFileHash('./data/snapshot.json');
console.log(`Snapshot hash ${snapshotHash}`);
const result = await contract.getResultForSnapshotHash(snapshotHash);
console.log(`Random number : ${result}`);
pickAllRaffleWinners(ranges,result,'winnersForVerification.json');
const originalWinners = getParticipantsFileHash('winnersForVerification.json');
const verifiedWinners = getParticipantsFileHash('winners.json');
const verified = originalWinners === verifiedWinners;
if(verified) {
    console.log('Verification succesfull! The exact same result has been succesfully reconstructed!')
}
else {
    console.log('Verification failed!')
}




