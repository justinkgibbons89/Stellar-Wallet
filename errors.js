const Stellar = require('stellar-sdk')

class Errors {

  static parse(e) {
    console.log(e.response.data.extras)
  }

  static transactionResult(e) {
    console.log(e.response.data.extras.result_codes.transaction)
  }

  static operationResults(e) {
    console.log(e.response.data.extras.result_codes.operations)
  }
}

module.exports = Errors
