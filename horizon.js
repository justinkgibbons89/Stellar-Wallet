const Stellar = require('stellar-sdk');
const Errors = require('./errors.js')

class Horizon {

  //Properties
  static get minimumReserve() { return "3" }
  static get magicFaucet() {
    let sec = "SBJJ66MG6UWZAXM5GIAJOPULF46WQMV2HQ6GNGOGRARAWIAJSFY5NZGB"
    return Stellar.Keypair.fromSecret(sec)
  }

  //Initialization
  constructor() {
    Stellar.Network.useTestNetwork()
    this.server = new Stellar.Server('https://horizon-testnet.stellar.org');
    this.timeout = 30
  }

  selectNetwork(network) {
    switch (network) {
      case "test": Stellar.Network.useTestNetwork()
      case "public": Stellar.Network.usePublicNetwork()
    }
  }

  //Core Requests
  async account(publicKey) {
    return this.server.loadAccount(publicKey)
  }

  async fee() {
    return this.server.fetchBaseFee()
  }

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

  //Basic Transactions
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
