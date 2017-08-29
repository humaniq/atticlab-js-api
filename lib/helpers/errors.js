/* * Copyright 2017 Atticlab LLC.
 * Licensed under the Apache License, Version 2.0
 * See the LICENSE or LICENSE_UA file at the root of this repository
 * Contact us at http://atticlab.net
 */
function createError(errorName) {
    var err = function (message, descr) {
        this.name = errorName;
        this.message = (message || "");
        this.description = (descr || "");
    };

    err.prototype = Error.prototype;
    return err;
};

module.exports = {
    InvalidField: createError('InvalidField'),
    MissingField: createError('MissingField'),
    ConnectionError: createError('ConnectionError'),
    DataCorrupt: createError('DataCorrupt'),
    UnknownError: createError('UnknownError'),
    ApiError: createError('ApiError'),

    getProtocolError: function (code, msg) {
        if (typeof msg == 'undefined') {
            msg = '';
        }

        switch (code) {
            case 'ERR_BAD_PARAM':
            case 'ERR_BAD_SIGN':
            case 'ERR_BAD_TYPE':
            case 'ERR_ROUTE_NOT_FOUND':
            case 'ERR_USER_NOT_FOUND':
            case 'ERR_COMPANY_NOT_FOUND':
            case 'ERR_SERVICE':
            case 'ERR_EMPTY_PARAM':
            case 'ERR_ALREADY_EXISTS':
            case 'ERR_NOT_FOUND':
            case 'ERR_NOT_IMPLEMENTED':
            case 'ERR_NOT_ALLOWED':
            case 'ERR_INV_EXPIRED':
            case 'ERR_INV_REQUESTED':
            case 'ERR_TX':
            case 'ERR_ENROLLMENT_EXPIRED':
            case 'ERR_ENROLLMENT_NOT_ACCEPTED':
            case 'ERR_TOO_MUCH_INVITEES':
            case 'ERR_MAINTENANCE':
                return new this.ApiError(code, msg);

            default:
                return new this.UnknownError(code, 'Unknown error');
        }
    }
}