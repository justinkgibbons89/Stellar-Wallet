const Stellar = require('stellar-sdk')
const Horizon = require('./horizon.js')
const Store = require('./store.js')

class Wallet {

  //Constructors
  static async create(walletName) {
    let wallet = new Wallet()
    wallet.name = walletName
    wallet.keypair = this.newKeypair()
    let horizon = new Horizon()
    await horizon.createAccount(wallet.keypair, Horizon.magicFaucet)
    return wallet
  }

  static from(secretKey, walletName) {
    let wallet = new Wallet()
    wallet.name = walletName
    wallet.keypair = Stellar.Keypair.fromSecret(secretKey)
    return wallet
  }

  //Properties
  get address() {
    return this.keypair.publicKey()
  }

  get secretKey() {
    return this.keypair.secret()
  }

  //Helpers
  static newKeypair() {
    return Stellar.Keypair.random()
  }

  //Actions
  async pay(address, amount, assetName) {
    let horizon = new Horizon()
    await horizon.send(address, this.keypair, String(amount), assetName)
  }
}

module.exports = Wallet
