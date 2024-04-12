const axios = require('axios');
const fs = require('fs');
const ProgressBar = require('progress');

async function calculateUptime() {
    const rpcEndpoint = 'http://localhost:26657'; 
    const startBlock = 237907;
    const endBlock = 355327;
    const totalBlocks = endBlock - startBlock + 1;
    const progressBar = new ProgressBar('Fetching blocks [:bar] :current/:total', { total: totalBlocks });

    const validatorSignatures = {}; 

    for (let i = startBlock; i <= endBlock; i++) {
        try {
            const blockResponse = await axios.get(`${rpcEndpoint}/block?height=${i}`);
            progressBar.tick();
            if (blockResponse.data && blockResponse.data.result && blockResponse.data.result.block && blockResponse.data.result.block.last_commit && blockResponse.data.result.block.last_commit.signatures) {
                const filteredSignatures = blockResponse.data.result.block.last_commit.signatures.filter(signature => signature.signature !== null && signature.validator_address !== "");

                filteredSignatures.forEach(signature => {
                    if (!validatorSignatures[signature.validator_address]) {
                        validatorSignatures[signature.validator_address] = 0;
                    }
                    validatorSignatures[signature.validator_address]++;
                });
            }
        } catch (error) {
            console.error(`Error fetching block data for block height ${i}:`, error);
        }
    }

    const outputFilePath = 'uptime_237907-355327.txt';
    const outputStream = fs.createWriteStream(outputFilePath);
    outputStream.write("Validator Address : Total signed\n");
    Object.keys(validatorSignatures).forEach(validator => {
        outputStream.write(`${validator}: ${validatorSignatures[validator]}\n`);
    });
    outputStream.end();

    console.log("Output written to uptime.txt");
}

calculateUptime();
