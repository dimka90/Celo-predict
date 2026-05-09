const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    // Configuration
    const RPC_URL = "https://forno.celo.org";
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const FUND_AMOUNT = "0.05"; // Capped Budget
    const PRIX_TOKEN_ADDRESS = "0x36489A2cB87fB0ca8E9d0fE2350D082b90FDC68E";
    const PRIX_AMOUNT = "100.0"; // PRIX per wallet
    const MAX_GAS_PRICE = ethers.parseUnits("250", "gwei");

    if (!PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY environment variable is not set.");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, { 
        staticNetwork: new ethers.Network("celo", 42220),
        batchMaxCount: 1 
    });
    const masterWallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // PRIX Token Contract
    const prixAbi = ["function transfer(address to, uint256 amount) public returns (bool)", "function balanceOf(address account) public view returns (uint256)"];
    const prixContract = new ethers.Contract(PRIX_TOKEN_ADDRESS, prixAbi, masterWallet);

    // Fixed High-Priority Fees for Mainnet Push
    const maxFeePerGas = MAX_GAS_PRICE;
    const maxPriorityFeePerGas = ethers.parseUnits("2", "gwei");

    const armyPath = path.join(__dirname, "../../army-wallets.json");
    const army = JSON.parse(fs.readFileSync(armyPath, "utf8"));

    console.log(`Resuming/Starting optimized funding for army...`);

    let nonce = await masterWallet.getNonce();
    console.log(`Starting nonce: ${nonce}`);

    for (const soldier of army) {
        // Simple skip if already funded (check CELO balance)
        const soldierBalance = await provider.getBalance(soldier.address);
        if (soldierBalance >= ethers.parseEther(FUND_AMOUNT)) {
            console.log(`Relay Agent ${soldier.id} already funded. Skipping.`);
            continue;
        }

        console.log(`----------------------------------------------------`);
        console.log(`Funding soldier ${soldier.id}: ${soldier.address} (Nonce: ${nonce})...`);

        try {
            // 1. Send CELO
            const celoTx = await masterWallet.sendTransaction({
                to: soldier.address,
                value: ethers.parseEther(FUND_AMOUNT),
                nonce: nonce++,
                maxFeePerGas,
                maxPriorityFeePerGas,
                gasLimit: 21000n
            });
            console.log(`  CELO Transaction sent: ${celoTx.hash}`);

            // 2. Send PRIX
            const prixTx = await prixContract.transfer(soldier.address, ethers.parseUnits(PRIX_AMOUNT, 18), {
                nonce: nonce++,
                maxFeePerGas,
                maxPriorityFeePerGas,
                gasLimit: 100000n
            });
            console.log(`  PRIX Transaction sent: ${prixTx.hash}`);

            // To avoid overloading the RPC's mempool/nonce limit, we wait every 50 soldiers
            if (soldier.id % 50 === 0) {
                console.log("  Waiting for batch confirmation...");
                await prixTx.wait();
            }
        } catch (error) {
            console.error(`  Failed to fund ${soldier.address}:`, error.message);
            // Refresh nonce if there's an error
            nonce = await masterWallet.getNonce();
        }
    }

    console.log("Optimized funding distribution complete!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
