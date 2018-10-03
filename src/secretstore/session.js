"use strict";

const utils = require("../utils.js");

class SecretStoreSessionError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
        this.name = "SecretStoreSessionError";
    }
};

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
                var sserror = new SecretStoreSessionError("Request failed.", response);
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
                var sserror = new SecretStoreSessionError("Request failed.", response);
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
                var sserror = new SecretStoreSessionError("Request failed.", response);
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
                var sserror = new SecretStoreSessionError("Request failed.", response);
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
                var sserror = new SecretStoreSessionError("Request failed.", response);
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
                var sserror = new SecretStoreSessionError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(utils.removeEnclosingDQuotes(body));
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
                var sserror = new SecretStoreSessionError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(body);
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
                var sserror = new SecretStoreSessionError("Request failed.", response);
                reject(sserror);
            }
            else {
                resolve(utils.removeEnclosingDQuotes(body));
            }
        });
    });
}

module.exports = {
    SecretStoreSessionError,
    generateServerKey,
    generateServerAndDocumentKey,
    storeDocumentKey,
    retrieveDocumentKey,
    shadowRetrieveDocumentKey,
    signSchnorr,
    signEcdsa,
    nodesSetChange,
}