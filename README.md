# JS Api

**Create api object**

```js
var smart_api = require('js-api');

var SmartApi = new smart_api({
    host: 'http://192.168.1.125:8180'
});
```

**Set keypair for signed api calls**

```js
SmartApi.setKeypair(StellarSdk.Keypair.fromSeed('SAANXP4M47WTOMQO6BSV5HQOZBJDF3LOR3WD4D2MOF452O7ESPJMDLET'));
```

> **Notice** Check ./test/test.js for better implementation details. Api docs will be updated soon.

## SmartApi.Wallets
#### `SmartApi.Wallets.create()`
#### `SmartApi.Wallets.get()`
#### `SmartApi.Wallets.update()`
#### `SmartApi.Wallets.updatePassword()`
#### `SmartApi.Wallets.notExist()`

## SmartApi.Admins
#### `SmartApi.Admins.create()`
#### `SmartApi.Admins.get()`
#### `SmartApi.Admins.getList()`
#### `SmartApi.Admins.delete()`

## SmartApi.Agents
#### `SmartApi.Admins.create()`
#### `SmartApi.Admins.getList()`

## SmartApi.Bans
#### `SmartApi.Admins.create()`
#### `SmartApi.Admins.getList()`
#### `SmartApi.Admins.delete()`

## SmartApi.Cards
#### `SmartApi.Admins.create()`
#### `SmartApi.Admins.get()`
#### `SmartApi.Admins.getList()`

## SmartApi.Companies
#### `SmartApi.Admins.create()`
#### `SmartApi.Admins.get()`
#### `SmartApi.Admins.getList()`

## SmartApi.Enrollments
#### `SmartApi.Admins.accept()`
#### `SmartApi.Admins.approve()`
#### `SmartApi.Admins.decline()`
#### `SmartApi.Admins.getList()`
#### `SmartApi.Admins.getForUser()`
#### `SmartApi.Admins.getForAgent()`

## SmartApi.Invoices
#### `SmartApi.Admins.create()`
#### `SmartApi.Admins.get()`
#### `SmartApi.Admins.getList()`
#### `SmartApi.Admins.getStatistics()`

## SmartApi.Merchants
#### `SmartApi.Admins.createStore()`
#### `SmartApi.Admins.getStores()`
#### `SmartApi.Admins.getOrder()`
#### `SmartApi.Admins.getStoreOrders()`

## SmartApi.Regusers
#### `SmartApi.Admins.create()`
#### `SmartApi.Admins.getList()`
