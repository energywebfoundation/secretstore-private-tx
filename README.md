# secretstore-private-js
[Node package](https://www.npmjs.com/package/secretstore-private-js) for Parity's Secret Store and Private Transaction API calls and sessions.
Originally made for the [Energy Web Foundation](http://energyweb.org/).

## Why
To make your life simple when you want to work with these features.

## What can I find here
The abstraction of..

 - Parity's [secretstore module](https://wiki.parity.io/JSONRPC-secretstore-module)

 - various [secretstore sessions](https://wiki.parity.io/Secret-Store)

 - Parity's [private module](https://wiki.parity.io/JSONRPC-secretstore-module)

## How to install
Just simply do:
```
npm install secretstore-private-js
```
like any other node package.

## Basic documentation

https://ngyam.github.io/secretstore-private-js/

## Can I see examples?
Yes, you can find doing the Parity tutorials with this package [in my other repo](https://github.com/ngyam/tutorial-secretstore-privatetx)

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

Then:

 1. ``` npm run start``` launches a cluster of 3 configured Secret Store nodes which you can find in `nodes_ss_dev/`. The nodes also have their respective chain db and log files here.
 2. ```npm test```
 3. ```npm run stop``` to stop the nodes when you are done

You can wipe the local chan db and secret store db with ```npm run clear``` if needed.
It might be the case that you need to send some funds for the test accounts. You can use the [fund script](nodes_ss_dev/fund.sh) for this purpose.
```
./fund.sh address1 address2 address3 ..
```

## Contribution
Please feel free to open issues/pull requests with improvements.

## Resources used
 - Official Parity JSON-RPC API documentation: modules [secretstore](https://wiki.parity.io/JSONRPC-secretstore-module) and [private](https://wiki.parity.io/JSONRPC-private-module)
 - Parity wiki and tutorials: [Secret Store](https://wiki.parity.io/Secret-Store) and [Private transactions](https://wiki.parity.io/Private-Transactions)
