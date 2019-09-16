/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        // Add your code here
        let self = this;

        let genesisBlock = new Block.Block("First block in the chain - Genesis block");
        genesisBlock.height = 1;
        genesisBlock.time = new Date().getTime().toString().slice(0,-3);
        genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();

        return self.bd.addLevelDBData(genesisBlock.height, JSON.stringify(genesisBlock).toString());
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        // Add your code here
        let self = this;
        return self.getLevelDBData()
            .then(height => resolve(height))
            .catch(error => reject(error));
    }

    // Add new block
    addBlock(block) {
        // Add your code here
        let self = this;
        // Block height
        return self.getBlockHeight()
            .then(height => {
                block.height = height+1;
                // UTC timestamp
                block.time = new Date().getTime().toString().slice(0,-3);
                
                if(block.height>1){
                    self.getBlock(height)
                        .then(preBlock =>{
                            // previous block hash
                            block.previousBlockHash = preBlock.hash;
                            // Block hash with SHA256 using newBlock and converting to a string
                            block.hash = SHA256(JSON.stringify(block)).toString();

                            self.bd.addLevelDBData(block.height, JSON.stringify(block).toString());
                        })
                        .catch(error => console.log(error));
                }
                else{
                    // Block hash with SHA256 using newBlock and converting to a string
                    block.hash = SHA256(JSON.stringify(block)).toString();

                    self.bd.addLevelDBData(block.height, JSON.stringify(block).toString());
                  
                }
            })
            .catch(error => console.log(error));
    }

    // Get Block By Height
    getBlock(height) {
        // Add your code here
        let self = this;
        return self.getLevelDBData(height)
            .then(value => resolve(value))
            .catch(error => reject(error));
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        // Add your code here
        let self = this;
        return self.getBlock(height)
            .then(block => {
                // get block object
                let tempBlock = JSON.parse(block);
                // get block hash
                let blockHash = tempBlock.hash;
                // remove block hash to test block integrity
                tempBlock.hash = '';
                // generate block hash
                let validBlockHash = SHA256(JSON.stringify(tempBlock)).toString();
                // Compare
                if (blockHash===validBlockHash) {
                    return Promise.resolve({isValidBlock: true, block: objBlock});
                    } else {
                    console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
                    return Promise.reject({isValidBlock: false, block: objBlock});
                    }
            })
            .catch(error => console.log(error));
    }

    // Validate Blockchain
    validateChain() {
        // Add your code here
        let self = this;
        let errorLog = [];
        return self.getBlocksCount()
            .then.(height => {
                for (var i = 1; i <= height; i++) {
                    return self.getBlock(i)
                    .then(block => self.validBlock(block.height))
                    .then(({isValidBlock,block}) => {
                        // validate block
                        if (!self.validateBlock(i)) errorLog.push(i);
                        // compare blocks hash link
                        if (i < height-1) return self.getBlock(i+1)
                            .then(lastBlock => {
                                let blockHash = block.hash;
                                let previousHash = lastBlock.previousBlockHash;

                                if (blockHash!==previousHash) errorLog.push(i);
                            })
                            .catch(error => console.log(error));
                        if (errorLog.length>0) {
                            console.log('Block errors = ' + errorLog.length);
                            console.log('Blocks: '+errorLog);
                        } else {
                            console.log('No errors detected');
                        }
                    })
                }
            })
            .catch(error => console.log(error));
      
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports.Blockchain = Blockchain;
