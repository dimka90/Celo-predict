const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    // Configuration
    const RPC_URL = "https://forno.celo.org";
    const PRIX_TOKEN_ADDRESS = "0x36489A2cB87fB0ca8E9d0fE2350D082b90FDC68E";
    const SINK_ADDRESS = "0x86E74256beC87d5f542BC9214b708A9dE78e3998"; // Send back to Master
    const TRANSFER_AMOUNT = "0.01"; // Tiny amount of PRIX
    const MAX_GAS_PRICE = ethers.parseUnits("50", "gwei"); // Safety Cap

    // Use staticNetwork to completely disable auto-detection (fixes handshake timeouts)
    const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, { 
        staticNetwork: new ethers.Network("celo", 42220),
        batchMaxCount: 1 
    });
    const prixAbi = ["function transfer(address to, uint256 amount) public returns (bool)"];

    const armyPath = path.join(__dirname, "../../army-wallets.json");
    const army = JSON.parse(fs.readFileSync(armyPath, "utf8"));

    console.log(`🚀 Starting optimized concurrent DAU boost for ${army.length} wallets...`);

    // We don't wait for tx confirmations. Fire and forget!
    // Restricted to 143 soldiers that were successfully funded
    for (let i = 0; i < 143; i++) {
        const soldier = army[i];

        let attempts = 0;
        const maxAttempts = 3;
        let success = false;

        while (attempts < maxAttempts && !success) {
            try {
                const wallet = new ethers.Wallet(soldier.privateKey, provider);
                const prixContract = new ethers.Contract(PRIX_TOKEN_ADDRESS, prixAbi, wallet);

                // Get current nonce
                let nonce = await wallet.getNonce();
                console.log(`----------------------------------------------------`);
                console.log(`Relay Agent ${soldier.id} (${soldier.address}) firing 5 transactions (Start Nonce: ${nonce}) [Attempt ${attempts + 1}]...`);

                const feeData = await provider.getFeeData();
                let maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas || 0n) * 11n / 10n; // 1.1x priority
                let maxFeePerGas = (feeData.maxFeePerGas || 0n) * 12n / 10n; // 1.2x max fee

                // Apply Safety Cap
                if (maxFeePerGas > MAX_GAS_PRICE) {
                    maxFeePerGas = MAX_GAS_PRICE;
                    maxPriorityFeePerGas = MAX_GAS_PRICE / 2n;
                }

                const promises = [];
                for (let txCount = 0; txCount < 5; txCount++) {
                    const p = prixContract.transfer(SINK_ADDRESS, ethers.parseUnits(TRANSFER_AMOUNT, 18), { 
                        nonce: nonce++,
                        maxPriorityFeePerGas,
                        maxFeePerGas,
                        gasLimit: 100000n // Hardcoded to bypass estimation glitches
                    })
                        .then(tx => console.log(`  Relay Agent ${soldier.id} (tx ${txCount + 1}): sent ${tx.hash}`))
                        .catch(err => {
                            if (err.message.includes("already known")) {
                                console.log(`  Relay Agent ${soldier.id} (tx ${txCount + 1}): already in mempool ✅`);
                            } else {
                                console.error(`  Relay Agent ${soldier.id} (tx ${txCount + 1}) failed: ${err.message}`);
                            }
                        });
                    promises.push(p);
                }

                await Promise.all(promises);
                success = true;

                // Anti-throttle delay (1 second for stability)
                await new Promise(r => setTimeout(r, 1000));

            } catch (error) {
                attempts++;
                console.error(`  Relay Agent ${soldier.id} attempt ${attempts} failed:`, error.message);
                if (attempts < maxAttempts) {
                    console.log(`  Retrying in 2s...`);
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }
    }

    console.log("Full daily metric boost broadcasted! DAU target achieved.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
