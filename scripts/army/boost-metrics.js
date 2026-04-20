const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    // Configuration
    const RPC_URL = "https://forno.celo.org";
    const PRIX_TOKEN_ADDRESS = "0x36489A2cB87fB0ca8E9d0fE2350D082b90FDC68E";
    const SINK_ADDRESS = "0x86E74256beC87d5f542BC9214b708A9dE78e3998"; // Send back to Master
    const TRANSFER_AMOUNT = "0.01"; // Tiny amount of PRIX
    const BATCH_SIZE = 5;

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const prixAbi = ["function transfer(address to, uint256 amount) public returns (bool)", "function balanceOf(address account) public view returns (uint256)"];

    const armyPath = path.join(__dirname, "../../army-wallets.json");
    const army = JSON.parse(fs.readFileSync(armyPath, "utf8"));

    console.log(`🚀 Starting optimized concurrent DAU boost for ${army.length} wallets...`);

    for (let i = 0; i < army.length; i += BATCH_SIZE) {
        const batch = army.slice(i, i + BATCH_SIZE);
        console.log(`----------------------------------------------------`);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} users)...`);

        const promises = batch.map(async (soldier) => {
            try {
                const wallet = new ethers.Wallet(soldier.privateKey, provider);
                const prixContract = new ethers.Contract(PRIX_TOKEN_ADDRESS, prixAbi, wallet);

                // Keep small randomized delay within the batch for aesthetics
                const delay = Math.floor(Math.random() * 5000);
                await new Promise(r => setTimeout(r, delay));

                const tx = await prixContract.transfer(SINK_ADDRESS, ethers.parseUnits(TRANSFER_AMOUNT, 18));
                console.log(`  Soldier ${soldier.id}: Transaction sent: ${tx.hash}`);
                await tx.wait();
                console.log(`  Soldier ${soldier.id}: Confirmed!`);
                return true;
            } catch (error) {
                console.error(`  Soldier ${soldier.id} failed:`, error.message);
                return false;
            }
        });

        await Promise.all(promises);
        console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} complete.`);
    }

    console.log("Full daily metric boost complete! DAU target achieved.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
