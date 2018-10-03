# secretstore-private-js
Node package for Parity's Secret Store and Private Transaction API calls and sessions.

Resources used:
 - Official Parity JSON-RPC API documentation: modules [secretstore](https://wiki.parity.io/JSONRPC-secretstore-module) and [private](https://wiki.parity.io/JSONRPC-private-module)
 - Parity wiki and tutorials: [Secret Store](https://wiki.parity.io/Secret-Store) and [Private transactions](https://wiki.parity.io/Private-Transactions)

## Development
```
#clone the repo
npm install -D
```
### Run tests
Place the secret store enabled [Parity client](https://github.com/paritytech/parity-ethereum) in the root of the project directory. For the secret store feature he parity client needs to be compiled from source with some extra flags.
```
git clone https://github.com/paritytech/parity
cd parity
cargo build --features secretstore --release
```

 1. ``` npm run start``` launches a cluster of 3 configured Secret Store nodes which you can find in `nodes_ss_dev/`. The nodes also have their respective chain db and log files here.
 2. ```npm test```
 3. ```npm run stop``` to stop the nodes when you are done

You can wipe the local chan db and secret store db with ```npm run clear``` if needed.

