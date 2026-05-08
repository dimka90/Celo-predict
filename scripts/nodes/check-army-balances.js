const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const RPC_URL = "https://forno.celo.org";
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const armyPath = path.join(__dirname, "../../army-wallets.json");
    const army = JSON.parse(fs.readFileSync(armyPath, "utf8"));

    console.log(`Checking balances for ${army.length} soldiers...`);
    const lowBalanceSoldiers = [];
    const THRESHOLD = ethers.parseEther("0.01");

    for (let i = 0; i < army.length; i++) {
        const soldier = army[i];
        try {
            const balance = await provider.getBalance(soldier.address);
            if (balance < THRESHOLD) {
                lowBalanceSoldiers.push({
                    id: soldier.id,
                    address: soldier.address,
                    balance: ethers.formatEther(balance)
                });
            }
            if (i % 50 === 0) console.log(`  Checked ${i} soldiers...`);
        } catch (e) {
            console.error(`  Error checking soldier ${soldier.id}: ${e.message}`);
        }
    }

    console.log(`Found ${lowBalanceSoldiers.length} soldiers with low balance (< 0.01 CELO).`);
    fs.writeFileSync(path.join(__dirname, "../../low-balance-army.json"), JSON.stringify(lowBalanceSoldiers, null, 2));
    console.log("Results saved to low-balance-army.json");
}

main().catch(console.error);
