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

    get(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.present('code'))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.get('/companies/' + params.code);
            });
    }

    getList(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.number('limit', true))
            .then(validate.number('offset', true))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.get('/companies', {
                    params: _.pick(params, [
                        'offset',
                        'limit'
                    ])
                });
            });
    }

    create(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.present('code'))
            .then(validate.string('title'))
            .then(validate.string('address'))
            .then(validate.present('phone'))
            .then(validate.email('email'))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.post('/companies', _.pick(params, [
                    'code',
                    'title',
                    'address',
                    'phone',
                    'email'
                ]));
            });
    }
}