const Stellar = require('stellar-sdk');
const Errors = require('./errors.js')

const DefaultMinimumReserve = "20"
const MagicFaucetKey = "SBJJ66MG6UWZAXM5GIAJOPULF46WQMV2HQ6GNGOGRARAWIAJSFY5NZGB"

/*
  Horizon is a client for interacting with Stellar. It exposes basic network functionality for creating accounts and submitting transactions.
*/
class Horizon {

  //Properties
  static get minimumReserve() { return DefaultMinimumReserve }

  static get magicFaucet() { 
    let secretKey = MagicFaucetKey
    return Stellar.Keypair.fromSecret(secretKey)
  }

  //MARK: Initialization
  constructor(secretKey) {
    Stellar.Network.useTestNetwork() //live network not supported right now
    this.secretKey = secretKey
    this.server = new Stellar.Server('https://horizon-testnet.stellar.org');
    this.timeout = 30
  }

  //Only test network currently supported
  selectNetwork(network) {
    switch (network) {
      case "test": Stellar.Network.useTestNetwork()
      case "public": Stellar.Network.usePublicNetwork()
    }
  }

  //MARK: Core Network Requests

  //Returns an account object from a public key
  async account(publicKey) {
    return this.server.loadAccount(publicKey)
  }

  //The network base fee is determined by Stellar and must be fetched.
  async fee() {
    return this.server.fetchBaseFee()
  }

  // Builds a transaction envelope from a set of operations and a public key.
  async transaction(operations, publicKey) {
    let fee = await this.fee()
    let account = await this.account(publicKey)
    var opts = {}
    opts["fee"] = fee
    var transactionBuilder = new Stellar.TransactionBuilder(account, opts)
    for (let operation of operations) {
      transactionBuilder.addOperation(operation)
    }
    let transaction = transactionBuilder.setTimeout(this.timeout).build()
    return transaction
  }

  //Submits a transaction to the network
  //The transaction must be signed before submission.
  async submit(transaction) {
    try {
      let result = await this.server.submitTransaction(transaction);
      console.log(JSON.stringify(result, null, 2));
      console.log('\nSuccess! View the transaction at: ');
      console.log(result._links.transaction.href);
    } catch (e) {
      console.log('An error has occured:');
      Errors.operationResults(e)
    }
  }

  //MARK: Basic Transactions

  //Only lumens are supported as an asset right now.
  async send(address, source, amount, assetName) {
    var asset = null
    if (assetName == "lumen") { asset = Stellar.Asset.native() }
    let options = {
      "destination": address,
      "asset": asset,
      "amount": amount
    }
    let operation = Stellar.Operation.payment(options)
    let transaction = await this.transaction([operation], source.publicKey())
    transaction.sign(source)
    await this.submit(transaction)
  }

  async createAccount(newKeypair, faucetKeypair) {
    let horizon = new Horizon()
    let sourcePublicKey = faucetKeypair.publicKey()
    let options = {
      "destination": newKeypair.publicKey(),
      "startingBalance" : Horizon.minimumReserve
    }
    let operation = Stellar.Operation.createAccount(options)
    let transaction = await horizon.transaction([operation], sourcePublicKey)
    transaction.sign(faucetKeypair)
    await horizon.submit(transaction)
    console.log("Public: " + newKeypair.publicKey())
    console.log("Secret: " + newKeypair.secret())
  }
}

module.exports = Horizon
