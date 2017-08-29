/* * Copyright 2017 Atticlab LLC.
 * Licensed under the Apache License, Version 2.0
 * See the LICENSE or LICENSE_UA file at the root of this repository
 * Contact us at http://atticlab.net
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const stellar = require('js-sdk');
const sha256 = require('sha256');
const uuid = require('uuid-random');

chai.use(chaiAsPromised);
chai.use(require('chai-things'));
chai.should();

var smart_api = require('../index.js');

var SmartApi = new smart_api({
    host: 'http://192.168.1.141:8080/v1'
});

var testParams = {
    user: '__debug-' + Date.now(),
    pwd: '__debug__',
    distributionType: 3,
    ipAddr: '25.55.191.171'
};

// Set keypair for signed requests
var authKeypair = stellar.Keypair.random();
SmartApi.setKeypair(authKeypair);

describe('Admins', function () {
    let adminKey = stellar.Keypair.random();
    it('create', function () {
        return SmartApi.Admins.create({
            account_id: adminKey.publicKey(),
            name: 'Name',
            position: 'Position',
            comment: 'Comment'
        }).should.eventually.have.property('data')
            .that.has.property('name')
            .that.equal('Name')
    });

    it('get', function () {
        return SmartApi.Admins.get({
            account_id: adminKey.publicKey(),
        }).should.eventually.have.property('data')
            .that.has.property('account_id')
            .that.equal(adminKey.publicKey());
    });


    it('getList', function () {
        return SmartApi.Admins.getList({
            account_ids: [adminKey.publicKey()],
        }).should.eventually.have.property('data')
            .that.to.be.an('array')
            .that.is.notEmpty;
            //.that.contain.a.thing.with.property('account_id')
            // .that.equal(adminKey.publicKey());
    });

    it('delete', function () {
        return SmartApi.Admins.delete({
            account_id: adminKey.publicKey(),
        }).should.eventually.have.property('data')
            .that.has.property('deleted')
            .that.equal(true);
    });
});

describe('Companies', function () {
    let company_code = Date.now().toString();
    it('create', function () {
        return SmartApi.Companies.create({
            code: company_code,
            title: 'Test company',
            address: 'Address',
            phone: '123123',
            email: Date.now() + '-debug@debug.com',
        }).should.eventually.have.property('data')
            .that.has.property('code')
            .that.equal(company_code);
    });

    it('get', function () {
        return SmartApi.Companies.get({
            code: company_code,
        }).should.eventually.have.property('data')
            .that.has.property('code')
            .that.equal(company_code);
    });

    it('getList', function () {
        return SmartApi.Companies.getList()
            .should.eventually.have.property('data')
            .that.to.be.an('array')
            .that.is.notEmpty;
    });
});

describe('Agents', function () {
    var companyCode = Date.now().toString() + '-agent';
    var enrollment = null;
    it('create', function() {
        return SmartApi.Companies.create({
            code: companyCode,
            title: 'Test company',
            address: 'Address',
            phone: '123123',
            email: Date.now() + '-debug@debug.com',
        }).then((resp) => {
            return SmartApi.Agents.create({
                type: stellar.xdr.AccountType.accountAgent().value,
                company_code: companyCode,
            })
        }).then((resp) => {
            enrollment = resp.data.enrollment;
            return Promise.resolve(resp)
                .should.eventually.have.property('data')
                .that.has.property('enrollment');
        })
    });

    it('getList', function() {
        return SmartApi.Agents.getList({
            company_code: companyCode,
            type: testParams.distributionType,
        }).should.eventually.have.property('data')
            .that.to.be.an('array')
            .that.is.notEmpty;
    });

    it('getByEnrollment', function() {
        return SmartApi.Agents.getByEnrollment({
            enrollment: enrollment,
        }).should.eventually.have.property('data')
            .that.has.property('agent_type');
    });

});

describe('Enrollments', function () {
    var companyCode = Date.now().toString() + '-agent';
    var enrollment = null;

    it('accept', function () {
        return SmartApi.Companies.create({
            code: companyCode,
            title: 'Test company',
            address: 'Address',
            phone: '123123',
            email: Date.now() + '-debug@debug.com',
        }).then((resp) => {
            return SmartApi.Agents.create({
                type: stellar.xdr.AccountType.accountAgent().value,
                company_code: companyCode,
            })
        }).then((resp) => {
            enrollment = resp.data.enrollment;
            return SmartApi.Enrollments.accept({
                enrollment: enrollment
            }).should.eventually.have.property('data');
        });


    });

    it('approve', function () {
        setTimeout(function () {
            return SmartApi.Enrollments.approve({
                enrollment: enrollment
            }).then((resp) => {
                console.log(resp);
            })
        },1000);
    });

    it('decline', function () {
        setTimeout(function () {
            return SmartApi.Enrollments.decline({
                enrollment: enrollment
            }).should.eventually.have.property('data');
        },1000);
    });



});

describe('Invoices', function () {
    let invId;

    it('create', function () {
        return SmartApi.Invoices.create({
                asset: 'EUAH',
                amount: 100,
            })
            .then(resp => {
                invId = resp.data.id;
                return Promise.resolve(resp);
            }).should.eventually.have.property('data')
            .that.has.property('id');

    });

    it('get', function () {
        return SmartApi.Invoices.get({
            id: invId
        }).should.eventually.have.property('data')
            .that.has.property('amount')
            .that.equal(100);
    });

    it('getList', function () {
        return SmartApi.Invoices.getList({
            limit: 10,
            offset: 0
        }).should.eventually.have.property('data')
            .that.to.be.an('array')
            .that.is.notEmpty;
    });

    it('getStatistics', function () {
        return SmartApi.Invoices.getStatistics({
            limit: 10,
            offset: 0
        }).should.eventually.have.property('data')
            .that.to.be.an('array')
            .that.is.notEmpty;
    });
});

describe('Bonuses', function () {
    let faceId = uuid();

    it('create', function () {
        return SmartApi.Bonuses.create({
            'face_id': faceId
        }).should.eventually.have.property('data')
            .that.has.property('created_at');
    });

    it('check', function () {
        var keyp = stellar.Keypair.random();
        SmartApi.setKeypair(keyp); //set keypair for check bonuses
        return SmartApi.Bonuses.check({
            'face_id': faceId
        }).should.eventually.have.property('data')
            .that.has.property('account_id');
    });

    it('invitees', function () {
        SmartApi.setKeypair(authKeypair); //back to auth keypair
        return SmartApi.Bonuses.invitees()
            .should.eventually.have.property('data')
            .that.to.be.an('array')
            .that.is.notEmpty;
    });

});

describe('Logs', function () {
  it('getList', function () {
    return SmartApi.Logs.getList({
      limit: 10,
      offset: 0
    }).should.eventually.have.property('data')
    .that.to.be.an('array')
        .that.is.notEmpty;
  });

  it('get', function () {
      return SmartApi.Admins.get({
          account_id: stellar.Keypair.random(),
      }).catch(function (e) {

      }).then(function () {
          return SmartApi.Logs.getList({
              limit: 1,
              offset: 0
          });
      }).then(function (resp) {
          // console.log(resp.data[0].Id);
          return SmartApi.Logs.get({
              id: resp.data[0].Id
          })
      }).should.eventually.have.property('data');
  });

  it('process', function () {

      return SmartApi.Admins.get({
          account_id: stellar.Keypair.random(),
      }).catch(function (e) {

      }).then(function () {
          return SmartApi.Logs.getList({
              limit: 1,
              offset: 0
          });
      }).then(function (resp) {
          return SmartApi.Logs.process({
              ids: JSON.stringify([resp.data[0].Id])
          });
      }).should.eventually.have.property('data');
  })

});