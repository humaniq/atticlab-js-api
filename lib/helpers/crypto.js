/* * Copyright 2017 Atticlab LLC.
 * Licensed under the Apache License, Version 2.0
 * See the LICENSE or LICENSE_UA file at the root of this repository
 * Contact us at http://atticlab.net
 */
const sjcl = require('sjcl');
const _ = require('lodash');
const crypt = require("crypto-browserify");
require('sjcl-scrypt').extendSjcl(sjcl);

function base64Encode(str) {
    return (new Buffer(str)).toString('base64');
}

function base64Decode(str) {
    return (new Buffer(str, 'base64')).toString();
}

function makeHasher(algo) {
    return function (value) {
        var hasher = crypt.createHash(algo);
        return hasher.update(value).digest("hex");
    };
}

function parseHexString(str) {
    var result = [];
    while (str.length >= 8) {
        result.push(parseInt(str.substring(0, 8), 16));
        str = str.substring(8, str.length);
    }
    var obj = new Int32Array(result); //It's to take an Int32 values for overloading
    return Object.keys(obj).map(function (key) {
        return obj[key];
    });
}

function utf8StringFromBits(arr) {
    var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
    for (i = 0; i < bl / 8; i++) {
        if ((i & 3) === 0) {
            tmp = arr[i / 4];
        }
        out += String.fromCharCode(tmp >>> 24);
        tmp <<= 8;
    }
    return out;
}

function generateDeriveFromKeyFunction(token) {
    return function (masterKey) {
        var hmac = new sjcl.misc.hmac(masterKey, sjcl.hash.sha256);
        return hmac.encrypt(token);
    };
}

module.exports = {
    sha1: makeHasher('sha1'),
    sha256: makeHasher('sha256'),
    deriveWalletId: generateDeriveFromKeyFunction('WALLET_ID'),
    deriveWalletKey: generateDeriveFromKeyFunction('WALLET_KEY'),
    calculateMasterKey: function (params) {
        let versionBits = sjcl.codec.hex.toBits("0x01");
        let s0Bits = sjcl.codec.base64.toBits(params.salt);
        let usernameBits = sjcl.codec.utf8String.toBits(params.username);
        let unhashedSaltBits = _.reduce([versionBits, s0Bits, usernameBits], sjcl.bitArray.concat);
        let salt = sjcl.hash.sha256.hash(unhashedSaltBits);
        let password = params.passwordHash || params.password;

        return new Promise(function (resolve) {
            params.rawMasterKey = sjcl.misc.scrypt(
                password,
                salt,
                params.kdfParams.n,
                params.kdfParams.r,
                params.kdfParams.p,
                params.kdfParams.bits / 8
            );
            resolve(params);
        });
    },

    calculatePassword: function (params, cb) {
        return new Promise(function(resolve) {
            if (params.kdfParams.passwordHashAlgorithm && params.kdfParams.hashRounds) {
                var stringToHash = params.username + params.password + params.salt;
                var iterationsInRound = Math.floor(params.kdfParams.hashRounds / 100);
                var roundsDone = 1;
                var hashAlgorithm = params.kdfParams.passwordHashAlgorithm;

                if (!params.passwordHash) {
                    hashPassword(stringToHash);
                } else {
                    resolve(params);
                }
            } else { // no need for hash, resolve with password
                resolve(params);
            }

            function hashPassword(stringToHash) {
                for (let i = 0; i < iterationsInRound; i++) {
                    stringToHash = sjcl.hash[hashAlgorithm].hash(stringToHash);
                }
                roundsDone += 1;

                if (cb && typeof cb == 'function') {
                    cb(roundsDone);
                }

                if (roundsDone < 100) {
                    setTimeout(function () {
                        hashPassword(stringToHash);
                    }, 100);
                } else {
                    params.passwordHash = sjcl.codec.hex.fromBits(stringToHash);
                    resolve(params);
                }
            }
        });
    },

    encryptData: function (data, key) {
        if (!_.isString(data)) {
            throw new TypeError('data must be a String.');
        }

        const cipherName = 'aes';
        const modeName = 'gcm';

        let cipher = new sjcl.cipher[cipherName](key);
        let rawIV = sjcl.random.randomWords(3);
        let encryptedData = sjcl.mode[modeName].encrypt(
            cipher,
            sjcl.codec.utf8String.toBits(data),
            rawIV
        );

        data = JSON.stringify({
            IV: sjcl.codec.base64.fromBits(rawIV),
            cipherText: sjcl.codec.base64.fromBits(encryptedData),
            cipherName: cipherName,
            modeName: modeName
        });

        return base64Encode(data);
    },

    decryptData(encryptedData, key) {
        let rawCipherText, rawIV, cipherName, modeName;

        try {
            let resultObject = JSON.parse(base64Decode(encryptedData));
            rawIV = sjcl.codec.base64.toBits(resultObject.IV);
            rawCipherText = sjcl.codec.base64.toBits(resultObject.cipherText);
            cipherName = resultObject.cipherName;
            modeName = resultObject.modeName;
        } catch (e) {
            new errors.DataCorrupt();
        }

        let cipher = new sjcl.cipher[cipherName](key);
        let rawData = sjcl.mode[modeName].decrypt(cipher, rawCipherText, rawIV);
        return sjcl.codec.utf8String.fromBits(rawData);
    }
}