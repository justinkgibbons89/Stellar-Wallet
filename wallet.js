const Stellar = require('stellar-sdk')
const Horizon = require('./horizon.js')
const Store = require('./store.js')

/*
  Wallet is a wrapper for a Stellar keypair, with convenience methods for basic transactions. Wallet interfaces with Stellar through the Horizon class.
*/
class Wallet {

  // Initializes a new wallet with a new keypair, and funds it from 
  // a faucet account.
  static async create(walletName) {
    let wallet = new Wallet()
    wallet.name = walletName
    wallet.keypair = this.newKeypair()
    let horizon = new Horizon()
    await horizon.createAccount(wallet.keypair, Horizon.magicFaucet)
    return wallet
  }


  // Initializes a wallet from an existing secret key and funds it from a faucet
  // account.
  static from(secretKey, walletName) {
    let wallet = new Wallet()
    wallet.name = walletName
    wallet.keypair = Stellar.Keypair.fromSecret(secretKey)
    return wallet
  }

  //MARK: Properties
  get address() {
    return this.keypair.publicKey()
  }

  get secretKey() {
    return this.keypair.secret()
  }

  //MARK: Transactions
  // (use "lumen" for assetName for native lumens.)
  async pay(address, amount, assetName) {
    let horizon = new Horizon()
    await horizon.send(address, this.keypair, String(amount), assetName)
  }

  //MARK: Helpers
  static newKeypair() {
    return Stellar.Keypair.random()
  }

}

module.exports = Wallet
