const assert = require('chai').assert;
const path = require('path');
const ss = require(path.join(__dirname, '../src/secretstore'));
const sha256 = require('crypto-js/sha256');

const assets = require("./assets.js");
const {alice, bob, charlie} = assets.accounts;
const {alicepwd, bobpwd, charliepwd} = assets.passwords;
const {httpRpcAlice, httpRpcBob, httpRpcCharlie} = assets.httpRpc;
const {httpSSAlice, httpSSBob, httpSSCharlie} = assets.httpSS;
const {node1, node2, node3} = assets.nodes;

var web3 = new (require('web3'))(httpRpcAlice);

describe('Secret store correct inputs test', async () => {
    var doc;
    var hexDoc;
    var encryptedDoc;
    var docID;
    var signedDocID;
    var skey;
    var dkey;
    var retrievedKey;
    var shadowRetrievedKey;

    it('should sign raw hash', async () => {
        docID = sha256("lololol").toString();
        signedDocID = await ss.signRawHash(web3, alice, alicepwd, docID);
        assert.exists(signedDocID);
        assert.isNotEmpty(signedDocID);
    });

    it('should generate server key', async () => {
        docID = sha256(Math.random().toString()).toString();
        signedDocID = await ss.signRawHash(web3, alice, alicepwd, docID);
        skey = await ss.session.generateServerKey(httpSSAlice, docID, signedDocID, 1);
        assert.exists(skey);
        assert.isNotEmpty(skey);
    });

    it('should generate document key', async () => {
        dkey = await ss.generateDocumentKey(web3, alice, alicepwd, skey);
        assert.exists(dkey);
        assert.isNotEmpty(dkey);
    });

    it('should store the document key', async () => {
        var res = await ss.session.storeDocumentKey(httpSSAlice, docID, signedDocID, dkey.common_point, dkey.encrypted_point);
        assert.exists(res);
    });

    it('should generate server and document key', async () => {
        docID = sha256(Math.random().toString()).toString();
        signedDocID = await ss.signRawHash(web3, alice, alicepwd, docID);
        dkey = await ss.session.generateServerAndDocumentKey(httpSSAlice, docID, signedDocID, 1);
        assert.exists(dkey);
        assert.isNotEmpty(dkey);
    });

    it('should shadow retrieve document key', async () => {
        shadowRetrievedKey = await ss.session.shadowRetrieveDocumentKey(httpSSAlice, docID, signedDocID);
        assert.exists(shadowRetrievedKey);
        assert.isNotEmpty(shadowRetrievedKey);
    });

    it('should retrieve document key', async () => {
        retrievedKey = await ss.session.retrieveDocumentKey(httpSSAlice, docID, signedDocID);
        assert.exists(retrievedKey);
        assert.isNotEmpty(retrievedKey);
    });

    it('should encrypt a document', async () => {
        hexDoc = web3.utils.toHex("lololololol");
        encryptedDoc = await ss.encrypt(web3, alice, alicepwd, retrievedKey, hexDoc);
        assert.exists(encryptedDoc);
        assert.isNotEmpty(encryptedDoc);
    });

    it('should decrypt a document', async () => {
        decryptedDoc = await ss.decrypt(web3, alice, alicepwd, retrievedKey, encryptedDoc);
        assert.exists(decryptedDoc);
        assert.isNotEmpty(decryptedDoc);
        assert.equal(decryptedDoc, hexDoc);
    });

    it('should shadow decrypt a document', async () => {
        decryptedDoc = await ss.shadowDecrypt(
            web3,
            alice,
            alicepwd,
            shadowRetrievedKey.decrypted_secret,
            shadowRetrievedKey.common_point,
            shadowRetrievedKey.decrypt_shadows,
            encryptedDoc);
        assert.exists(decryptedDoc);
        assert.isNotEmpty(decryptedDoc);
        assert.equal(decryptedDoc, hexDoc);
    });

    it('should schnorr sign a message', async () => {
        let message = sha256("bongocat").toString();
        let signedMessage = await ss.session.signSchnorr(httpSSAlice, docID, signedDocID, message);
        assert.exists(signedMessage);
        assert.isNotEmpty(signedMessage);
    });

    it('should ecdsa sign a message', async () => {
        let message = sha256("bongocat").toString();
        let signedMessage = await ss.session.signEcdsa(httpSSAlice, docID, signedDocID, message);
        assert.exists(signedMessage);
        assert.isNotEmpty(signedMessage);
    });

    it('should compute hash of node ids', async () => {
        let theHash = await ss.serversSetHash(web3, [node1, node2]);
        assert.exists(theHash);
        assert.isNotEmpty(theHash);
    });

    xit('should change set of nodes (exclude charlie)', async () => {
        nodeIDsNewSet = [node1, node2];
        let hashOldSet = await ss.serversSetHash(web3, [node1, node2, node3]);
        let hashNewSet = await ss.serversSetHash(web3, nodeIDsNewSet); 
        
        let signatureOldSet = await ss.signRawHash(web3, alice, alicepwd, hashOldSet);
        let signatureNewSet = await ss.signRawHash(web3, alice, alicepwd, hashNewSet);
        
        let something = await ss.session.nodesSetChange(httpSSAlice, 
                                    nodeIDsNewSet, 
                                    signatureOldSet, 
                                    signatureNewSet);
        console.log(something);
        assert.exists(theHash);
        assert.isNotEmpty(theHash);
    });

    xit('should change set of nodes back to original (charlie is back)', async () => {
        nodeIDsNewSet = [node1, node2, node3];
        let hashOldSet = await ss.serversSetHash(web3, [node1, node2]);
        let hashNewSet = await ss.serversSetHash(web3, nodeIDsNewSet); 
        
        let signatureOldSet = await ss.signRawHash(web3, alice, alicepwd, hashOldSet);
        let signatureNewSet = await ss.signRawHash(web3, alice, alicepwd, hashNewSet);
        
        let something = await ss.session.nodesSetChange(httpSSAlice, 
                                    nodeIDsNewSet, 
                                    signatureOldSet, 
                                    signatureNewSet);
        console.log(something);
        assert.exists(theHash);
        assert.isNotEmpty(theHash);
    });
});
