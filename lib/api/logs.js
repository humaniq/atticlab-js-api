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

    return Promise.resolve(params).
        then(validate.present('id')).
        then(this.parent.getNonce.bind(this.parent)).
        then(function(params) {
          return self.parent.axios.get('/logs/' + params.id);
        });
  }

  getList(params) {
    var self = this;

    return Promise.resolve(params).
        then(validate.string('order', true)).
        then(validate.number('limit', true)).
        then(validate.number('offset', true)).
        then(validate.bool('is_processed', true)).
        then(validate.array('levels', true)).
        then(validate.array('services', true)).
        then(validate.number('date_start', true)).
        then(validate.number('date_end', true)).
        then(this.parent.getNonce.bind(this.parent)).
        then(function(params) {
          return self.parent.axios.get('/logs', {
            params: _.pick(params, [
              'order',
              'limit',
              'offset',
              'is_processed',
              'levels',
              'services',
              'date_start',
              'date_end',
            ]),
          });
        });
  }

  process(params) {
    var self = this;

    return Promise.resolve(params).
        then(validate.string('ids')).
        then(this.parent.getNonce.bind(this.parent)).
        then(function(params) {
          return self.parent.axios.post('/logs/process', _.pick(params, [
            'ids',
          ]));
        });
  }

};