const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    // Configuration
    const RPC_URL = "https://forno.celo.org";
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const FUND_AMOUNT = "0.015"; // Small top-up

    if (!PRIVATE_KEY) {
        console.error("Error: PRIVATE_KEY environment variable is not set.");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const masterWallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const lowBalancePath = path.join(__dirname, "../../low-balance-army.json");
    if (!fs.existsSync(lowBalancePath)) {
        console.error("Error: low-balance-army.json not found.");
        process.exit(1);
    }
    const lowBalanceSoldiers = JSON.parse(fs.readFileSync(lowBalancePath, "utf8"));

    console.log(`🚀 Starting targeted refuel for ${lowBalanceSoldiers.length} soldiers...`);
    let nonce = await masterWallet.getNonce();

    for (let i = 0; i < lowBalanceSoldiers.length; i++) {
        const soldier = lowBalanceSoldiers[i];

        try {
            console.log(`----------------------------------------------------`);
            console.log(`Refueling soldier ${soldier.id}: ${soldier.address} (Nonce: ${nonce})...`);

            const tx = await masterWallet.sendTransaction({
                to: soldier.address,
                value: ethers.parseEther(FUND_AMOUNT),
                nonce: nonce++
            });

            console.log(`  Transaction sent: ${tx.hash}`);

            // Wait every 25 transactions to ensure we don't get stuck
            if ((i + 1) % 25 === 0) {
                console.log("  Waiting for batch confirmation...");
                await tx.wait();
            }

        } catch (error) {
            console.error(`  Failed to fund soldier ${soldier.id}:`, error.message);
        }
    }

    console.log("Refueling complete! The army is combat-ready for the final day.");
}

main().catch(console.error);
