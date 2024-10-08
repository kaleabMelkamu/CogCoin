"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initP2PServer = exports.connectToPeers = exports.getSockets = void 0;
const ws_1 = __importDefault(require("ws"));
const block_1 = require("./block");
const sockets = [];
const getSockets = () => sockets;
exports.getSockets = getSockets;
const connectToPeers = (newPeer) => {
    const ws = new ws_1.default(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};
exports.connectToPeers = connectToPeers;
const initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
};
const initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        const message = JSON.parse(data);
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                ws.send(JSON.stringify(responseLatestMsg()));
                break;
            case MessageType.QUERY_ALL:
                ws.send(JSON.stringify(responseChainMsg()));
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};
// Define the types of messages that peers will send to each other
var MessageType;
(function (MessageType) {
    MessageType[MessageType["QUERY_LATEST"] = 0] = "QUERY_LATEST";
    MessageType[MessageType["QUERY_ALL"] = 1] = "QUERY_ALL";
    MessageType[MessageType["RESPONSE_BLOCKCHAIN"] = 2] = "RESPONSE_BLOCKCHAIN";
})(MessageType || (MessageType = {}));
class Message {
}
// Send a message requesting the latest block from the peer
const queryChainLengthMsg = () => ({ type: MessageType.QUERY_LATEST, data: null });
// Send a message requesting the full blockchain from the peer
const queryAllMsg = () => ({ type: MessageType.QUERY_ALL, data: null });
// Respond with the full blockchain
const responseChainMsg = () => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify((0, block_1.getBlockchain)()),
});
// Respond with the latest block
const responseLatestMsg = () => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([(0, block_1.getLatestBlock)()]),
});
// Handle the response when a peer sends a blockchain
const handleBlockchainResponse = (message) => {
    const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockHeld = (0, block_1.getLatestBlock)();
    // If the peer's latest block is ahead of this node's latest block
    if (latestBlockReceived.index > latestBlockHeld.index) {
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            (0, block_1.addBlock)(latestBlockReceived); // Add the new block to this node's chain
        }
        else {
            // TODO: Optionally implement full blockchain sync logic here if the peer's blockchain is longer
            console.log('Blockchain might be behind, requesting the full chain');
        }
    }
};
// Initialize the P2P server to listen for peer connections
const initP2PServer = (p2pPort) => {
    const server = new ws_1.default.Server({ port: p2pPort });
    server.on('connection', (ws) => {
        initConnection(ws);
    });
    console.log('Listening websocket p2p port on: ' + p2pPort);
};
exports.initP2PServer = initP2PServer;
