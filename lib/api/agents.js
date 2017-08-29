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
            .then(validate.number('type'))
            .then(validate.string('company_code'))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.post('/agents', _.pick(params, [
                    'type',
                    'company_code',
                ]))
            });
    }

    getList(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.string('company_code', true))
            .then(validate.number('type', true))
            .then(validate.number('limit', true))
            .then(validate.number('offset', true))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.get('/agents', {
                    params: _.pick(params, [
                        'company_code',
                        'type',
                        'offset',
                        'limit'
                    ])
                });
            });
    }

    getByEnrollment(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.string('enrollment'))
            .then(function (params) {
                return self.parent.axios.get('/agents/enrollment/' + params.enrollment);
            });
    }
}
