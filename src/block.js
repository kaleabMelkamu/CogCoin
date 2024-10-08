"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceChain = exports.isValidChain = exports.isValidNewBlock = exports.addBlock = exports.getLatestBlock = exports.getBlockchain = exports.getGenesisBlock = exports.generateNextBlock = exports.calculateHash = exports.Block = void 0;
class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
    }
}
exports.Block = Block;
const calculateHash = (index, previousHash, timestamp, data) => {
    return require('crypto').createHash('sha256').update(index + previousHash + timestamp + data).digest('hex');
};
exports.calculateHash = calculateHash;
const generateNextBlock = (blockData) => {
    const previousBlock = (0, exports.getLatestBlock)();
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime() / 1000;
    const nextHash = (0, exports.calculateHash)(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
};
exports.generateNextBlock = generateNextBlock;
const getGenesisBlock = () => {
    return new Block(0, "0", 1465154705, "genesis block", "816534932c2b16a98eb34a7895e35f00dff61d0e2b509c379fb3226e8f5b3f25");
};
exports.getGenesisBlock = getGenesisBlock;
let blockchain = [(0, exports.getGenesisBlock)()];
const getBlockchain = () => blockchain;
exports.getBlockchain = getBlockchain;
const getLatestBlock = () => blockchain[blockchain.length - 1];
exports.getLatestBlock = getLatestBlock;
const addBlock = (newBlock) => {
    if ((0, exports.isValidNewBlock)(newBlock, (0, exports.getLatestBlock)())) {
        blockchain.push(newBlock);
    }
};
exports.addBlock = addBlock;
const isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        return false;
    }
    else if (previousBlock.hash !== newBlock.previousHash) {
        return false;
    }
    else if ((0, exports.calculateHash)(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data) !== newBlock.hash) {
        return false;
    }
    return true;
};
exports.isValidNewBlock = isValidNewBlock;
const isValidChain = (blockchainToValidate) => {
    const isValidGenesis = (block) => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if (!isValidGenesis(blockchainToValidate[0])) {
        return false;
    }
    for (let i = 1; i < blockchainToValidate.length; i++) {
        if (!(0, exports.isValidNewBlock)(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return false;
        }
    }
    return true;
};
exports.isValidChain = isValidChain;
const replaceChain = (newBlocks) => {
    if ((0, exports.isValidChain)(newBlocks) && newBlocks.length > (0, exports.getBlockchain)().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcastLatest();
    }
    else {
        console.log('Received blockchain invalid');
    }
};
exports.replaceChain = replaceChain;
