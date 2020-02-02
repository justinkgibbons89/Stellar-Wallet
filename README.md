# Stellar-Wallet

A simple wallet for the Stellar network.

## How to use
Create a wallet:
```javascript
	let wallet = Wallet.create("myName") 
	console.log(wallet.address) //public stellar address
```

Send lumens between wallets:
```javascript
	let wallet2 = Wallet.create("myOtherName")
	wallet2.pay(wallet.address, 10, "lumens")
```

## To Do
- Public network support
- Non-native assets