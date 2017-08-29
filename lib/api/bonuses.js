/* * Copyright 2017 Atticlab LLC.
 * Licensed under the Apache License, Version 2.0
 * See the LICENSE or LICENSE_UA file at the root of this repository
 * Contact us at http://atticlab.net
 */
const validate = require('../helpers/validate.js');
const _ = require('lodash');

module.exports = class {
    constructor(parent) {
        this.parent = parent;
    }

    create(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.present('face_id'))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.post('/bonuses', _.pick(params, [
                    'face_id'
                ]))
            });
    }

    check(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.present('face_id'))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.post('/bonuses/check', _.pick(params, [
                    'face_id'
                ]))
            });
    }

    invitees(params) {
        var self = this;

        return Promise.resolve(params)
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.get('/bonuses/invitees');
            });
    }

}