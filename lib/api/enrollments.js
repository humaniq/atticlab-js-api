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

    accept(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.string('enrollment'))
            .then(validate.string('login', true))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.post('/enrollments/update/' + params.enrollment, _.pick(params, [
                    'login'
                ]));
            });
    }

    decline(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.string('enrollment'))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.post('/enrollments/update/' + params.enrollment);
            });
    }

    approve(params) {
        var self = this;

        return Promise.resolve(params)
            .then(validate.string('enrollment'))
            .then(this.parent.getNonce.bind(this.parent))
            .then(function (params) {
                return self.parent.axios.post('/enrollments/approve/' + params.enrollment);
            });
    }
};
