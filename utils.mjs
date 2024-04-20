
import fs from 'fs';
import { keccak256, toUtf8Bytes, toBigInt, toBeHex } from 'ethers';
import logger from './logger.mjs';

// Function to read a JSON file and hash it to be saved on chain
export function getParticipantsFileHash(filePath) {
    try {
        // Read the file
        const fileData = fs.readFileSync(filePath, 'utf8');

        // Parse the JSON file data
        const jsonData = JSON.parse(fileData);

        // Stringify the JSON object to ensure consistent formatting
        const jsonString = JSON.stringify(jsonData);

        // Hash the string using Keccak-256
        const hash = keccak256(toUtf8Bytes(jsonString));

        // Return the hash
        return hash;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


function updateRanges(users_, selectedNumber) {
    const users = [...users_];
    for (let i = 0; i < users.length; i++) {
        if (selectedNumber >= users[i].start && selectedNumber <= users[i].end) {
            logger.debug(`Found the user ${users[i].twitterName}`);
            // Check if the user has only one ticket
            if (users[i].start === users[i].end) {
                // Remove the user from the list
                users.splice(i, 1);
                logger.debug('removed a user new ranges' + users)
                for (let i = 0; i < users.length; i++) {
                    const element = users[i];
                    logger.debug(element); 
                }
            } else {
                // Decrease the end of the current user's range by one
                users[i].end--;
                logger.debug(`Removed one ticket of ${users[i].twitterName}, end range before : ${users[i].end+1}, end range now ${users[i].end}`)
            }

            // Adjust the ranges for all subsequent users
            for (let j = i + 1; j < users.length; j++) {
                users[j].start--;
                users[j].end--;
                logger.debug(`Shifted user range of ${users[j].twitterName}, from between : ${users[j].end + 1} - ${users[j].start + 1} to  ${users[j].end} - ${users[j].start}`);
            }
            break;  // Exit the loop after adjusting the ranges
        }

    }

    return users;
}

export function getBigIntAndPerformKeccak256(bigIntSeed) {
    try {

        //let bytesLike = '0x' + bigIntSeed.toString(16);
        const bytesLike = toBeHex(bigIntSeed)
        const hash = keccak256(bytesLike);
        return toBigInt(hash);
    }
    catch (err) {

        logger.error(err)
        throw err;
    }

}

function findUser(ranges, randomNumber) {
    const user = ranges.find(range => randomNumber >= range.start && randomNumber <= range.end);
    return user ? user.twitterName : null;
}

function getTotalNumberOfTickets(ranges) {
    return ranges[ranges.length - 1].end + 1; // +1 since we want the very last person to be included as well
}
export function pickUsers(ranges, randomNumber, numberOfWinners, tierName) {
    let rng = randomNumber
    const winners = []
    let totalTickets = getTotalNumberOfTickets(ranges);
    let totalTicketsBigInt = toBigInt(totalTickets);
    let randomNumberModuloed;
    for (let i = 0; i < numberOfWinners; i++) {
        randomNumberModuloed = rng % totalTicketsBigInt;
        const winner = findUser(ranges, parseInt(randomNumberModuloed));
        winners.push(winner);
        logger.info(` Winner: ${winner}, Total number of tickets : ${totalTicketsBigInt}, Random number (moduloed) : ${randomNumberModuloed}, Random number : ${rng}`);
        rng = getBigIntAndPerformKeccak256(rng);
        ranges = updateRanges(ranges, randomNumberModuloed);
        totalTickets = getTotalNumberOfTickets(ranges);
        totalTicketsBigInt = toBigInt(totalTickets);

    }
    return { winnerList: winners, seed: rng, tierName: tierName, modifiedRanges: ranges };
}

// Function to load users and assign ranges
export function assignRangesToUsers(snapshotFilePath) {
    const data = fs.readFileSync(snapshotFilePath, { encoding: 'utf8', flag: 'r' });
    const users = JSON.parse(data);
    let start = 0;
    const ranges = users.map(user => {
        const range = { twitterName: user.twitterName, start: start, end: start + user.tickets - 1 };
        start += user.tickets;
        return range;
    });

    return ranges;
}


export function pickAllRaffleWinners(ranges,randomNumber,winnersJsonPath) {
    const winners = {}

    let { winnerList, seed, tierName, modifiedRanges } = pickUsers(ranges, randomNumber, 40, 'Tier10');
    winners[tierName] = winnerList;
    ({ winnerList, seed, tierName, modifiedRanges } = pickUsers(modifiedRanges, seed, 20, 'Tier9'));
    winners[tierName] = winnerList;
    ({ winnerList, seed, tierName, modifiedRanges } = pickUsers(modifiedRanges, seed, 15, 'Tier8'));
    winners[tierName] = winnerList;
    ({ winnerList, seed, tierName, modifiedRanges } = pickUsers(modifiedRanges, seed, 10, 'Tier7'));
    winners[tierName] = winnerList;
    ({ winnerList, seed, tierName, modifiedRanges } = pickUsers(modifiedRanges, seed, 5, 'Tier6'));
    winners[tierName] = winnerList;
    ({ winnerList, seed, tierName, modifiedRanges } = pickUsers(modifiedRanges, seed, 1, 'Tier5'));
    winners[tierName] = winnerList;
    ({ winnerList, seed, tierName, modifiedRanges } = pickUsers(modifiedRanges, seed, 1, 'Tier4'));
    winners[tierName] = winnerList;
    ({ winnerList, seed, tierName, modifiedRanges } = pickUsers(modifiedRanges, seed, 1, 'Tier3'));
    winners[tierName] = winnerList;
    ({ winnerList, seed, tierName, modifiedRanges } = pickUsers(modifiedRanges, seed, 1, 'Tier2'));
    winners[tierName] = winnerList;
    ({ winnerList, seed, tierName, modifiedRanges } = pickUsers(modifiedRanges, seed, 1, 'Tier1'));
    winners[tierName] = winnerList;

    fs.writeFileSync(winnersJsonPath, JSON.stringify(winners));



}