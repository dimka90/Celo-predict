const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const armySize = 60;
    const wallets = [];

    console.log(`Generating army of ${armySize} wallets...`);

    for (let i = 0; i < armySize; i++) {
        const wallet = ethers.Wallet.createRandom();
        wallets.push({
            id: i + 1,
            address: wallet.address,
            privateKey: wallet.privateKey,
            createdAt: new Date().toISOString()
        });
    }

    const outputPath = path.join(__dirname, "../../army-wallets.json");
    fs.writeFileSync(outputPath, JSON.stringify(wallets, null, 2));

    console.log(`Successfully generated ${armySize} wallets.`);
    console.log(`Wallet data saved to: ${outputPath}`);
    console.log(`IMPORTANT: Ensure army-wallets.json is in your .gitignore!`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
