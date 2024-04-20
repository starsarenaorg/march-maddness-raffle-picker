import { JsonRpcProvider, Wallet, Contract, toBigInt } from 'ethers';
import fs from 'fs';

export class VRFHelper {
    constructor(providerUrl, privateKey, contractAddress, abiPath) {
        this.provider = new JsonRpcProvider(providerUrl);
        if(privateKey) {
            this.wallet = new Wallet(privateKey, this.provider);
        }
        else {
            this.wallet = this.provider;
        }
        this.contractAddress = contractAddress;
        this.contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        this.contract = new Contract(this.contractAddress, this.contractABI, this.wallet);
    }

    async rollDice(participantsHash) {
        try {
            const tx = await this.contract.rollDice(participantsHash);
            const receipt = await this.provider.waitForTransaction(tx.hash);
            const requestId = this.getRequestIdFromReceipt(receipt);
            return requestId;
        } catch (error) {
            console.error("Error in rollDice:", error);
        }
    }

    async checkRollFinalization(requestId) {
        try {
            while (true) {
                const rollInfo = await this.contract.getRoll(requestId);
                if (rollInfo.result !== toBigInt(0)) {
                    console.log('Finalized... Breaking...');
                    return rollInfo.result;
                } else {
                    console.log('Waiting...');
                    await this.sleep(5000);
                }
            }
        } catch (error) {
            console.error("Error in checkRollFinalization:", error);
        }
    }

    getRequestIdFromReceipt(txReceipt) {
        const relevantLogs = txReceipt.logs.filter(log => log.address.toLowerCase() === this.contractAddress.toLowerCase());

        const decodedEvents = relevantLogs.map(log => {
            try {
                return this.contract.interface.parseLog(log);
            } catch (error) {
                return null;
            }
        }).filter(event => event !== null);
        console.log(decodedEvents)
        return decodedEvents[0].args[0]; // Assuming DiceRolled event with requestId as the first argument
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getResultForSnapshotHash(snapshotHash) {
        return await this.contract.snapshotHashToResult(snapshotHash);
    }
}


