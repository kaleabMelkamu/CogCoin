### description

CogCoin is a cryptocurrency to show how cryptocurrencies, blocks are created using Typescript

This coin was created for demonstration and learning purposes. Since it does not have a “mining” algorithm (PoS of PoW) it cannot used in a public network. It nonetheless implements the basic features for a functioning blockchain.

### current features

- Genesis Block 
- Adding new block to the blockchain
- Mining with difficulty adjustment
- Block validation
- Peer to Peer integration
- Postman Api interaction

### Project Setup

1. **Clone the repository**:
    ```bash
    git clone https://github.com/kaleabMelkamu/CogCoin.git
    cd CogCoin
    ```

2. **Install dependencies**:
    Ensure you have Node.js installed. Then run:
    ```bash
    npm install
    ```

3. **Build the project**:
    Compile the TypeScript code into JavaScript:
    ```bash
    npm run build
    ```

4. **Run the application**:
    Start the application:
    ```bash
    npm start
    ```

  ### Running the Application

- The application will start on `http://localhost:3003`.
- The blockchain runs with a P2P server on port `6001` by default.

### Running Multiple Nodes

To run multiple instances of the blockchain, follow these steps:

1. **Run the first node (default)**:
    ```bash
    npm start
    ```
    - HTTP API is served at `http://localhost:3003`
    - P2P network runs on `ws://localhost:6001`

2. **Run a second node on different ports**:
    Open a new terminal window and run:
    ```bash
    HTTP_PORT=3005 P2P_PORT=6005 npm start
    ```
    - HTTP API will be served at `http://localhost:3005`
    - P2P network will run on `ws://localhost:6005`

3. **Run more nodes**:
    Repeat the above step with different `HTTP_PORT` and `P2P_PORT` values. For example:
    ```bash
    HTTP_PORT=3006 P2P_PORT=6006 npm start
    ```

4. **Add peers to the network**:
    After running multiple nodes, connect them to each other using the `/addPeer` API:
    - For instance, to connect node 1 (`ws://localhost:6001`) to node 2 (`ws://localhost:6005`):
    ```bash
    POST http://localhost:3003/addPeer
    Body: { "peer": "ws://localhost:6005" }
    ```

### API Endpoints

You can interact with the blockchain via the following API routes:

1. **GET /blocks**:
    - Fetch all the blocks in the blockchain.
    ```bash
    GET http://localhost:3003/blocks
    ```

2. **POST /mineBlock**:
    - Generate the next block by providing block data.
    ```bash
    POST http://localhost:3003/mineBlock
    Body: { "data": "Your block data" }
    ```

3. **POST /addPeer**:
    - Add a new peer to the P2P network.
    ```bash
    POST http://localhost:3003/addPeer
    Body: { "peer": "ws://localhost:6001" }
    ```

4. **GET /peers**:
    - Retrieve the list of connected peers.
    ```bash
    GET http://localhost:3003/peers
    ```

### Testing with Postman

Follow these steps to test the API using Postman:

1. **Open Postman** and create a new request.
2. **Select GET or POST** method depending on the route you want to test.
3. **For GET requests**:
    - Example: Fetch all blocks.
    ```bash
    GET http://localhost:3003/blocks
    ```
4. **For POST requests**:
    - Example: Mine a new block.
    ```bash
    POST http://localhost:3003/mineBlock
    Body: { "data": "Your block data" }
    ```
5. **Add a peer**:
    - Example: Add a new peer to the network.
    ```bash
    POST http://localhost:3003/addPeer
    Body: { "peer": "ws://localhost:6001" }
    ```
Make sure to use `application/json` as the `Content-Type` for POST requests.    

