// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    kovan: {
      network_id: '*',
      host: 'localhost',
      port: 8545
    }
  }
}
