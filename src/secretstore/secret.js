"use strict";

const utils = require("../utils.js");

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

module.exports = {
    signRawHash,
    generateDocumentKey,
    encrypt,
    decrypt,
    shadowDecrypt,
    serversSetHash
}