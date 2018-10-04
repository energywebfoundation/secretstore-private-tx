const path = require('path');
const assert = require('chai').assert;

const assets = require("./assets.js");
const {alice, bob, charlie} = assets.accounts;
const {alicepwd, bobpwd, charliepwd} = assets.passwords;
const {httpRpcAlice, httpRpcBob, httpRpcCharlie} = assets.httpRpc;
const {httpSSAlice, httpSSBob, httpSSCharlie} = assets.httpSS;
const {node1, node2, node3} = assets.nodes;
const TestContract = assets.TestContract;

var web3 = new (require('web3'))(httpRpcAlice);

const private = require(path.join(__dirname, '../src/private'));

describe('Private transactions correct inputs test', async () => {
    
    var publicTx;
    var composure;
    var privateContract;
    var contractAddress;

    it('should compose a regular public tx', async () => {
        publicTx = await private.composePublicTx(web3, {gas: web3.utils.toHex(1000000),
            gasPrice: web3.utils.toHex(1000), from: alice, to: null, data: TestContract.bytecode});
        assert.exists(publicTx);
        assert.isNotEmpty(publicTx);
    });

    it('should compose a private deployment tx', async () => {
        signedTx = await web3.eth.personal.signTransaction(publicTx, alicepwd);
        composure = await private.composeDeploymentTx(web3, signedTx.raw, [bob], web3.utils.toHex(1000));
        assert.exists(composure.receipt);
        assert.isNotEmpty(composure.receipt);
        assert.exists(composure.transaction);
        assert.isNotEmpty(composure.transaction);
        contractAddress = composure.receipt.contractAddress;
    });

    it('should broadcast a private deployment tx', async () => {
        signedTx = await web3.eth.personal.signTransaction(composure.transaction, alicepwd);
        let receipt = await web3.eth.sendSignedTransaction(signedTx.raw);
        assert.exists(receipt);
        assert.isNotEmpty(receipt);
    });

    it('should read private state', async () => {
        privateContract = new web3.eth.Contract(TestContract.abi, contractAddress);
        let encodedData = privateContract.methods.x().encodeABI();
        let nonce = web3.utils.toHex((await web3.eth.getTransactionCount(alice)));
        state = await private.call(web3, {from:alice, to:contractAddress, data:encodedData, nonce: nonce});
        assert.exists(state);
        assert.isNotEmpty(state);
    });

    it('should modify private state', async () => {
        let setXData = await privateContract.methods.setX(web3.utils.toHex("42")).encodeABI();
        let nonce = web3.utils.toHex((await web3.eth.getTransactionCount(alice)));
        publicTx = await private.composePublicTx(web3, {gas: web3.utils.toHex(1000000),
            gasPrice: web3.utils.toHex(1000), from: alice, to: contractAddress, data: setXData});
        
        signedTx = await web3.eth.personal.signTransaction(publicTx, alicepwd);
        let receipt = await private.send(web3, signedTx.raw);
        assert.exists(receipt);
        assert.isNotEmpty(receipt);
    });

    it('should return contract key', async () => {
        let retval = await private.contractKey(web3, contractAddress);
        assert.exists(retval);
        assert.isNotEmpty(retval);
    });

});
