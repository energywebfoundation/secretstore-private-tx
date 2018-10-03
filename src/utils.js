"use strict";

/**
 * Converts the input to a string, then
 * removes leading "0x" if it has any.
 * 
 * @param {any} val The input
 */
function remove0x(val) {
    if (val === undefined || val === null ) return "";
    var str = val.toString();
    if (str.startsWith("0x")) {
        return str.slice(2);
    }
    return str;
}

/**
 * Adds a leading "0x" to a string if it doesn't have already
 * 
 * @param {String} str The string
 */
function add0x(str) {
    if (!str.startsWith("0x")) {
        return "0x" + str;
    }
    return str;
}

function removeEnclosingDQuotes(str) {
    return str.replace(/^"(.*)"$/, '$1');
}

function logFailedResponse(response, body, options) {
    console.log("Request failed");
    console.log("StatusCode: " + response.statusCode);
    console.log("StatusMessage: " + response.statusMessage);
    console.log("Body: " + body);
    console.log("Request options: " + JSON.stringify(options));
}

function logError(e) {
    console.log("Error:");
    console.log(e);
}

module.exports = {
    remove0x,
    add0x,
    removeEnclosingDQuotes,
    logFailedResponse,
    logError
}