/**
 * @module private
 */

"use strict";

const utils = require("../utils.js");

/**
 * Composes a regular public transaction with the missing fields filled in. Delegates to 
 * {@link https://wiki.parity.io/JSONRPC-parity-module#parity_composetransaction `parity_composeTransaction`} RPC API call.
 * This method is not part of the official {@link https://wiki.parity.io/JSONRPC-private-module `Parity private API`}, just here for convenience.
 * 
 * @memberof module:private
 * @param {Object} web3 The web3 instance
 * @param {Object} tx The transaction object, which can be partially incomplete
 * @returns {Promise<Object>} The complete transaction object, missing fields filled in by defaults
 */
function composePublicTx(web3, tx, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'parity_composeTransaction',
            params: [tx],
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
 * Crafts a specific transaction wrapping a private contract inside a public contract. 
 * The resulting transaction is later expected to be signed and broadcasted. The "to-be-deployed" 
 * contract's address can be found in the return value.
 * 
 * @memberof module:private
 * @param {Object} web3 The web3 instance
 * @param {String} rawData The raw transaction data
 * @param {Array<String>} validators List of private validators
 * @param {String} gasPrice Gas price for the transaction. Default is "0x0"
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<Object>} The transaction’s receipt object and the transaction object
 */
function composeDeploymentTx(web3, rawData, validators, gasPrice="0x0", verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'private_composeDeploymentTransaction',
            params: ["latest", rawData, validators, gasPrice],
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
 * Reads the state of a private contract, given that the account in the `from` field has the key 
 * to decrypt the private contract’s state. This call happens off-chain and no transaction 
 * gets broadcasted.
 * 
 * @memberof module:private
 * @param {Object} web3 The web3 instance
 * @param {Object} tx The transaction object
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<Object>} The private state
 */
function call(web3, tx, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'private_call',
            params: ["latest", tx],
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
 * Broadcast a previously signed transaction to the validators for them to 
 * read, and to validate the state change of a private contract.
 * 
 * @memberof module:private
 * @param {Object} web3 The web3 instance
 * @param {Object} tx The transaction object
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<Object>} The contract address, status and the public transaction's hash
 */
function send(web3, tx, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'private_sendTransaction',
            params: [tx],
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
 * Returns document key ID associated with the deployed public contract.
 * 
 * @memberof module:private
 * @param {Object} web3 The web3 instance
 * @param {String} address Address of the private contract
 * @param {Boolean} verbose Whether to console log errors
 * @returns {Promise<String>} Document key ID associated with the deployed public contract
 */
function contractKey(web3, address, verbose=true) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'private_contractKey',
            params: [address],
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
    composePublicTx,
    composeDeploymentTx,
    send,
    call,
    contractKey,
}