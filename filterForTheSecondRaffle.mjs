import fs from 'fs';


// Function to extract unique twitter handles from the tier data
function extractUniqueHandles(data) {
    const allNames = Object.values(data).flat();
    const uniqueNames = new Set(allNames);
    console.log('Extracted unique twitter handles:', Array.from(uniqueNames));
    return uniqueNames;
}

function extractUniqueHandlesFromFilteredUsers(filteredUsersJsonPath) {
    const allNames = JSON.parse(fs.readFileSync(filteredUsersJsonPath));
    const uniqueNames = new Set(allNames);
    console.log('Extracted unique twitter handles:', Array.from(uniqueNames));
    return uniqueNames;
}

// Function to filter and update the second JSON based on unique handles
function filterTwitterHandles(uniqueNames, originalSnapshotPath) {
    // Read the second JSON file
    fs.readFile(originalSnapshotPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const entries = JSON.parse(data);
        const filteredEntries = entries.filter(entry => {
            if (uniqueNames.has(entry.twitterHandle)) {
                console.log(`Removing entry: ${entry.twitterHandle}`);
                return false;
            }
            return true;
        });

        uniqueNames.forEach(name => {
            if (!entries.some(entry => entry.twitterHandle === name)) {
                console.log(`Name from first list not found in second list: ${name}`);
            }
        });

        // Optionally, write the filtered data back to a file or handle it otherwise
        fs.writeFileSync('./data/filtered_second_raffle_snapshot.json',JSON.stringify(filteredEntries))
    });
}


const uniqueNames =  extractUniqueHandlesFromFilteredUsers('./data/filteredUsers.json');
filterTwitterHandles(uniqueNames, './data/snapshot.json');
