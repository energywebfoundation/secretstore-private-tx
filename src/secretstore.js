"use strict";

const path = require('path');
const utils = require(path.join(__dirname, "./utils.js"));

class SSRequestError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
        this.name = "SSRequestError";
    }
};

/**
 * 
 * Computes recoverrable ECDSA signatures which are used in the Secret Store: signatures of server key id and signatures of nodes set hash
 * 
 * @param {Object} web3 The web3 instance
 * @param {String} account Account of SS user
 * @param {String} pwd Password of SS user
 * @param {String} hash The 256-bit hash to be signed (server key id or nodes set hash)
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<String>} The signed hash
 */
function signRawHash(web3, account, pwd, hash, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'secretstore_signRawHash',
            params: [account, pwd, utils.add0x(hash)],
            id: 1
        }, (e, r) => {
            if (e) {
                if (verbose) utils.logError(e);
                reject(e);
            }
            else if (r.error !== undefined) {
                if (verbose) utils.logError(r.error);
                reject(r.error);
            }
            else {
                resolve(r.result);
            }
        });
    });
}

/**
 * Generates server keys.
 * 
 * @param {String} url URL where the SS node is listening for incoming requests
 * @param {String} serverKeyID The server key ID
 * @param {String} signedServerKeyID The server key ID signed by SS user
 * @param {Number} threshold Key threshold value. Please consider the guidelines when choosing this value: https://wiki.parity.io/Secret-Store.html#server-key-generation-session
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<String>} The hex-encoded public portion of server key
 */
function generateServerKey(url, serverKeyID, signedServerKeyID, threshold, verbose=true) {

    return new Promise((resolve, reject) => {
        const request = require('request');

        var options = {
            url: url + "/shadow/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID) + "/" + threshold,
            method: 'POST'
        };

        request(options, (error, response, body) => {
            if (error) {
                if (verbose) utils.logError(e);
                reject(error);
            }
            else if (response.statusCode != 200) {
                if (verbose) utils.logFailedResponse(response, body, options);
                var sserror = new SSRequestError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(utils.removeEnclosingDQuotes(body));
            }
        });
    });
}

/**
 * Generating document key by one of the participating nodes. 
 * While it is possible (and more secure, if you’re not trusting the Secret Store nodes) 
 * to run separate server key generation and document key storing sessions, 
 * you can generate both keys simultaneously
 * 
 * @param {String} url URL where the SS node is listening for incoming requests
 * @param {String} serverKeyID The server key ID
 * @param {String} signedServerKeyID The server key ID signed by SS user
 * @param {Number} threshold Key threshold value. Please consider the guidelines when choosing this value: https://wiki.parity.io/Secret-Store.html#server-key-generation-session
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<String>} The hex-encoded document key, encrypted with requester public key (ECIES encryption is used)
 */
function generateServerAndDocumentKey(url, serverKeyID, signedServerKeyID, threshold, verbose=true) {

    return new Promise((resolve, reject) => {
        const request = require('request');

        var options = {
            url: url + "/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID) + "/" + threshold,
            method: 'POST'
        };

        request(options, (error, response, body) => {
            if (error) {
                if (verbose) utils.logError(e);
                reject(error);
            }
            else if (response.statusCode != 200) {
                if (verbose) utils.logFailedResponse(response, body, options);
                var sserror = new SSRequestError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(utils.removeEnclosingDQuotes(body));
            }
        });
    });
}

/**
 * This session is a preferable way of retrieving previously generated document key
 * 
 * @param {String} url URL where the SS node is listening for incoming requests
 * @param {String} serverKeyID The server key ID
 * @param {String} signedServerKeyID The server key ID signed by SS user
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<Object>} The hex-encoded decrypted_secret, common_point and decrypt_shadows fields
 */
function shadowRetrieveDocumentKey(url, serverKeyID, signedServerKeyID, verbose=true) {
    return new Promise((resolve, reject) => {
        const request = require('request');

        var options = {
            url: url + "/shadow/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID),
            method: 'GET'
        };

        request(options, (error, response, body) => {
            if (error) {
                if (verbose) utils.logError(e);
                reject(error);
            }
            else if (response.statusCode != 200) {
                if (verbose) utils.logFailedResponse(response, body, options);
                var sserror = new SSRequestError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(JSON.parse(body));
            }
        });
    });
}

/**
 * Run the lighter version of the `document key shadow retrieval` session, 
 * which returns final document key (though, encrypted with requester public key) if you have enough trust in Secret Store nodes. 
 * During document key shadow retrieval session, document key is not reconstructed on any node. 
 * But it requires Secret Store client either to have an access to Parity RPCs, or to run some EC calculations to decrypt the document key.
 * 
 * @param {String} url URL where the SS node is listening for incoming requests
 * @param {String} serverKeyID The server key ID
 * @param {String} signedServerKeyID The server key ID signed by SS user
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<String>} The hex-encoded document key, encrypted with requester public key (ECIES encryption is used)
 */
function retrieveDocumentKey(url, serverKeyID, signedServerKeyID, verbose=true) {
    return new Promise((resolve, reject) => {
        const request = require('request');

        var options = {
            url: url + "/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID),
            method: 'GET'
        };

        request(options, (error, response, body) => {
            if (error) {
                if (verbose) utils.logError(e);
                reject(error);
            }
            else if (response.statusCode != 200) {
                if (verbose) utils.logFailedResponse(response, body, options);
                var sserror = new SSRequestError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(utils.removeEnclosingDQuotes(body));
            }
        });
    });
}

/**
 * Schnorr signing session, for computing Schnorr signature of a given message hash
 * 
 * @param {String} url URL where the SS node is listening for incoming requests
 * @param {String} serverKeyID The server key ID
 * @param {String} signedServerKeyID The server key ID signed by SS user
 * @param {String} messageHash The 256-bit hash of the message that needs to be signed
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<String>} The hex-encoded Schnorr signature (serialized as c || s), encrypted with requester public key (ECIES encryption is used)
 */ 
function signSchnorr(url, serverKeyID, signedServerKeyID, messageHash, verbose=true) {
    return new Promise((resolve, reject) => {
        const request = require('request');

        var options = {
            url: url + "/schnorr/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID) + "/" + messageHash,
            method: 'GET'
        };

        request(options, (error, response, body) => {
            if (error) {
                if (verbose) utils.logError(e);
                reject(error);
            }
            else if (response.statusCode != 200) {
                if (verbose) utils.logFailedResponse(response, body, options);
                var sserror = new SSRequestError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(utils.removeEnclosingDQuotes(body));
            }
        });
    });
}

/**
 * ECDSA signing session, for computing ECDSA signature of a given message hash
 * 
 * @param {String} url URL where the SS node is listening for incoming requests
 * @param {String} serverKeyID The server key ID
 * @param {String} signedServerKeyID The server key ID signed by SS user
 * @param {String} messageHash The 256-bit hash of the message that needs to be signed
 * @param {Boolean} verbose Whether to console log errors
 * @return {Promise<String>} The hex-encoded ECDSA signature (serialized as r || s || v), encrypted with requester public key (ECIES encryption is used)
 */ 
function signEcdsa(url, serverKeyID, signedServerKeyID, messageHash, verbose=true) {
    return new Promise((resolve, reject) => {
        const request = require('request');

        var options = {
            url: url + "/ecdsa/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID) + "/" + messageHash,
            method: 'GET'
        };

        request(options, (error, response, body) => {
            if (error) {
                if (verbose) utils.logError(e);
                reject(error);
            }
            else if (response.statusCode != 200) {
                if (verbose) utils.logFailedResponse(response, body, options);
                var sserror = new SSRequestError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(utils.removeEnclosingDQuotes(body));
            }
        });
    });
}

/**
 * Securely generates document key, so that it remains unknown to all key servers
 * 
 * @param {Object} web3 The web3 instance
 * @param {String} account Account of SS user
 * @param {String} pwd Password of SS user
 * @param {String} serverKey The server key, returned by a server key generating session
 * @param {Boolean} verbose Whether to console log errors
 * @return {Promise<String>} The document key
 */
function generateDocumentKey(web3, account, pwd, serverKey, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'secretstore_generateDocumentKey',
            params: [account, pwd, serverKey],
            id: 1
        }, (e, r) => {
            if (e) {
                if (verbose) utils.logError(e);
                reject(e);
            }
            else if (r.error !== undefined) {
                if (verbose) utils.logError(r.error);
                reject(r.error);
            }
            else {
                resolve(r.result);
            }
        });
    });
}

/**
 * You can use it to encrypt a small document. Can be used after running a document key retrieval session or a server- and document key generation session
 * 
 * @param {Object} web3 The web3 instance
 * @param {String} account Account of SS user
 * @param {String} pwd Password of SS user
 * @param {String} encryptedKey Document key encrypted with requester's public key
 * @param {String} hexDocument Hex encoded document data
 * @param {Boolean} verbose Whether to console log errors
 * @return {Promise<String>} The encrypted secret document
 */
function encrypt(web3, account, pwd, encryptedKey, hexDocument, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'secretstore_encrypt',
            params: [account, pwd, encryptedKey, hexDocument],
            id: 1
        }, (e, r) => {
            if (e) {
                if (verbose) utils.logError(e);
                reject(e);
            }
            else if (r.error !== undefined) {
                if (verbose) utils.logError(r.error);
                reject(r.error);
            }
            else {
                resolve(r.result);
            }
        });
    });
}

/**
 * This method can be used to decrypt document, encrypted by `encrypt` method before
 * 
 * @param {Object} web3 The web3 instance
 * @param {String} account Account of SS user
 * @param {String} pwd Password of SS user
 * @param {String} encryptedKey Document key encrypted with requester's public key
 * @param {String} encryptedDocument Encrypted document data, returned by "encrypt"
 * @param {Boolean} verbose Whether to console log errors
 * @return {Promise<String>} The decrypted secret document
 */
function decrypt(web3, account, pwd, encryptedKey, encryptedDocument, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'secretstore_decrypt',
            params: [account, pwd, encryptedKey, encryptedDocument],
            id: 1
        }, (e, r) => {
            if (e) {
                if (verbose) utils.logError(e);
                reject(e);
            }
            else if (r.error !== undefined) {
                if (verbose) utils.logError(r.error);
                reject(r.error);
            }
            else {
                resolve(r.result);
            }
        });
    });
}

/**
 * This method can be used to decrypt document, encrypted by `encrypt` method before
 * 
 * @param {Object} web3 The web3 instance
 * @param {String} account Account of SS user
 * @param {String} pwd Password of SS user
 * @param {String} decryptedSecret Field from `document key shadow retrieval session` result
 * @param {String} commonPoint Field from `document key shadow retrieval session` result
 * @param {String} decryptShadows Field from `document key shadow retrieval session` result
 * @param {String} encryptedDocument Encrypted document data, returned by `encrypt`
 * @param {Boolean} verbose Whether to console log errors
 * @return {Promise<String>} The decrypted secret document
 */
function shadowDecrypt(web3, account, pwd, decryptedSecret, commonPoint, decryptShadows, encryptedDocument, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'secretstore_shadowDecrypt',
            params: [account, pwd, decryptedSecret, commonPoint, decryptShadows, encryptedDocument],
            id: 1
        }, (e, r) => {
            if (e) {
                if (verbose) utils.logError(e);
                reject(e);
            }
            else if (r.error !== undefined) {
                if (verbose) utils.logError(r.error);
                reject(r.error);
            }
            else {
                resolve(r.result);
            }
        });
    });
}

/**
 * Binds an externally-generated document key to a server key. Useable after a `server key generation` session.
 * 
 * @param {String} url URL where the SS node is listening for incoming requests
 * @param {String} serverKeyID Same ID that was used in `server key generation session`
 * @param {String} signedServerKeyID Same server key id, signed by the same entity (author) that has signed the server key id in the `server key generation session`
 * @param {String} commonPoint The hex-encoded common point portion of encrypted document key
 * @param {String} encryptedPoint The hex-encoded encrypted point portion of encrypted document key
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<String>} Empty body of the response if everything was OK
 */
function storeDocumentKey(url, serverKeyID, signedServerKeyID, commonPoint, encryptedPoint, verbose=true) {
    return new Promise((resolve, reject) => {
        const request = require('request');

        var options = {
            url: url + "/shadow/" + utils.remove0x(serverKeyID)
                + "/" + utils.remove0x(signedServerKeyID)
                + "/" + utils.remove0x(commonPoint)
                + "/" + utils.remove0x(encryptedPoint),
            method: 'POST'
        };

        request(options, (error, response, body) => {
            if (error) {
                if (verbose) utils.logError(e);
                reject(error);
            }
            else if (response.statusCode != 200) {
                if (verbose) utils.logFailedResponse(response, body, options);
                var sserror = new SSRequestError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(body);
            }
        });
    });
}

/**
 * 
 * Computes the hash of nodes ids, required to compute nodes set signature for manual `nodes set change` session
 * 
 * @param {Object} web3 The web3 instance
 * @param {Array<String>} nodeIDs node IDs of the "new set"
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<String>} The hash
 */
function serversSetHash(web3, nodeIDs, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'secretstore_serversSetHash',
            params: [nodeIDs],
            id: 1
        }, (e, r) => {
            if (e) {
                if (verbose) utils.logError(e);
                reject(e);
            }
            else if (r.error !== undefined) {
                if (verbose) utils.logError(r.error);
                reject(r.error);
            }
            else {
                resolve(r.result);
            }
        });
    });
}

/**
 * Nodes set change session. Requires all added, removed and stable nodes to be online for the duration of the session. 
 * Before starting the session, you’ll need to generate two administrator’s signatures: 
 * `old set` signature and `new set` signature. To generate these signatures, 
 * the Secret Store RPC methods should be used: `serversSetHash` and `signRawHash`
 * 
 * @param {String} url URL where the SS node is listening for incoming requests
 * @param {String} nodeIDsNewSet node IDs of the `new set`
 * @param {String} signatureOldSet ECDSA signature of all online nodes IDs `keccak(ordered_list(staying + added + removing))`
 * @param {String} signatureNewSet ECDSA signature of nodes IDs, that should stay in the Secret Store after the session ends `keccak(ordered_list(staying + added))`
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<Object>} Unknown
 */
function nodesSetChange(url, nodeIDsNewSet, signatureOldSet, signatureNewSet, verbose=true) {
    return new Promise((resolve, reject) => {
        const request = require('request');

        /*
        let x = '["' + nodeIDsNewSet[0] + '"';
        for(var i = 1; i < nodeIDsNewSet.length; i++) {
            x += ',"' + nodeIDsNewSet[i] + '"';
        }
        x += ']';
        */
        var options = {
            url: url + "/admin/servers_set_change"
                + "/" + utils.remove0x(signatureOldSet)
                + "/" + utils.remove0x(signatureNewSet),
            method: 'POST',
            body: JSON.stringify(nodeIDsNewSet)
            //body: x
        };

        request(options, (error, response, body) => {
            if (error) {
                if (verbose) utils.logError(e);
                reject(error);
            }
            else if (response.statusCode != 200) {
                if (verbose) utils.logFailedResponse(response, body, options);
                var sserror = new SSRequestError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(utils.removeEnclosingDQuotes(body));
            }
        });
    });
}


module.exports = {
    SSRequestError,
    signRawHash,
    generateServerKey,
    generateDocumentKey,
    generateServerAndDocumentKey,
    storeDocumentKey,
    retrieveDocumentKey,
    shadowRetrieveDocumentKey,
    encrypt,
    decrypt,
    shadowDecrypt,
    signSchnorr,
    signEcdsa,
    serversSetHash,
    nodesSetChange
}