import { Server } from 'ws';
import WebSocket from 'ws';

import { addBlock, Block, getBlockchain, getLatestBlock } from './block';

const sockets: WebSocket[] = [];

export const getSockets = () => sockets;

export const connectToPeers = (newPeer: string) => {
    const ws = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
        console.log('Successfully connected to peer: ' + newPeer);
    });
    ws.on('error', () => {
        console.log('Connection failed');
        setTimeout(() => connectToPeers(newPeer), 5000);
    });
};

const initConnection = (ws: WebSocket) => {
    sockets.push(ws);
    initMessageHandler(ws);
    ws.send(JSON.stringify(queryChainLengthMsg()));
};

const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        const message: Message = JSON.parse(data);
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

enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
}

class Message {
    public type: MessageType;
    public data: string;

    constructor(type: MessageType, data: string) {
        this.type = type;
        this.data = data;
    }
}
const queryChainLengthMsg = (): Message => ({ type: MessageType.QUERY_LATEST, data: '' });
const queryAllMsg = (): Message => ({ type: MessageType.QUERY_ALL, data: '' });

const responseChainMsg = (): Message => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify(getBlockchain()),
});
const responseLatestMsg = (): Message => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([getLatestBlock()]),
});

// const handleBlockchainResponse = (message: Message) => {
//     const receivedBlocks: Block[] = JSON.parse(message.data).sort((b1: Block, b2: Block) => (b1.index - b2.index));
//     const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
//     const latestBlockHeld = getLatestBlock();

//     if (latestBlockReceived.index > latestBlockHeld.index) {
//         if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
//             addBlock(latestBlockReceived);
//         } else {
//             console.log('Blockchain behind, need to sync');
//         }
//     }
// };

// const handleBlockchainResponse = (message: Message) => {
//     const receivedBlocks: Block[] = JSON.parse(message.data).sort((b1: Block, b2: Block) => (b1.index - b2.index));
//     const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
//     const latestBlockHeld = getLatestBlock();

//     if (latestBlockReceived.index > latestBlockHeld.index) {
//         console.log('Blockchain behind. Syncing...');
//         if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
//             // If the latest block in the peer is directly linked to our latest block, we just add it
//             addBlock(latestBlockReceived);
//             broadcastLatest(); // Notify other peers about the latest block
//         } else {
//             // Request the full blockchain from the peer if we are significantly behind
//             console.log('Requesting full blockchain sync');
//             ws.send(JSON.stringify(queryAllMsg())); // Request all blocks
//         }
//     }
// };

const handleBlockchainResponse = (message: Message) => {
    const receivedBlocks: Block[] = JSON.parse(message.data).sort((b1: Block, b2: Block) => (b1.index - b2.index));
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockHeld = getLatestBlock();

    if (latestBlockReceived.index > latestBlockHeld.index) {
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            // Add the new block
            addBlock(latestBlockReceived);
            broadcastLatest();
        } else {
            // Replace the entire chain if the received one is valid
            console.log('Syncing full blockchain');
            
        }
    }
};





export const initP2PServer = (p2pPort: number) => {
    const server: Server = new WebSocket.Server({ port: p2pPort });
    server.on('connection', (ws: WebSocket) => {
        initConnection(ws);
    });
    console.log('Listening websocket p2p port on: ' + p2pPort);
};

const broadcastLatest = () => {
    sockets.forEach(socket => {
        socket.send(JSON.stringify(responseLatestMsg()));
    });
};

export { broadcastLatest };

