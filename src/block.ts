import * as CryptoJS from 'crypto-js';
import { broadcastLatest } from './p2p';
import {hexToBinary} from './util';
class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: string;
    public difficulty: number;
    public nonce: number;

    constructor(index: number, hash: string, previousHash: string, timestamp: number, data: string, difficulty: number, nonce: number) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nonce = nonce;
        
    }
}

const genesisBlock: Block = new Block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', '', 1465154705, 'my genesis block!!',0,0
);

let blockchain: Block[] = [genesisBlock];
// in seconds
const BLOCK_GENERATION_INTERVAL: number = 30;
// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

const getBlockchain = (): Block[] => blockchain;

const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

const calculateHash = (index: number, previousHash: string, timestamp: number, data: string, difficulty: number, nonce: number): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();

const hashMatchesDifficulty = (hash: string, difficulty: number): boolean => {
    const hashInBinary: string | null = hexToBinary(hash);
    if (hashInBinary === null) {
        throw new Error(`Invalid hash: ${hash}`); 
    }
    const requiredPrefix: string = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};




const adjustDifficulty = (previousBlock: Block, currentTimestamp: number): number => {
    const expectedTime: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL; // Total expected time
    const actualTime: number = currentTimestamp - previousBlock.timestamp; // Time taken to mine the last block

    if (actualTime < expectedTime / 2) {
        return previousBlock.difficulty + 1; // Increase difficulty
    } else if (actualTime > expectedTime * 2) {
        return previousBlock.difficulty - 1; // Decrease difficulty
    }
    return previousBlock.difficulty; // Keep the same difficulty
};


const findBlock = (index: number, previousHash: string, timestamp: number, data: string, difficulty: number): Block => {
    let nonce = 0;
    while (true) {
        const hash: string = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};

const generateNextBlock = (blockData: string): Block => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;

    let newDifficulty = previousBlock.difficulty;

    if (nextIndex % DIFFICULTY_ADJUSTMENT_INTERVAL === 0) {
        newDifficulty = adjustDifficulty(previousBlock, nextTimestamp);
    }

    const nonce: number = 0; 
    const nextHash: string = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData, newDifficulty, nonce);
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData, newDifficulty, nonce)
    addBlock(newBlock);
    broadcastLatest();
    return newBlock;
};

const addBlock = (newBlock: Block) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};

const isValidBlockStructure = (block: Block): boolean => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'string'
        && typeof block.difficulty === 'number'
        && typeof block.nonce === 'number';
};

const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('Invalid structure');
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('Invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('Invalid previous hash');
        return false;
    }
    
    else if (calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data, newBlock.difficulty, newBlock.nonce) !== newBlock.hash) {
        console.log('Invalid hash');
        return false;
    }
    return true;
};


export { Block, getBlockchain, getLatestBlock, generateNextBlock,addBlock };
