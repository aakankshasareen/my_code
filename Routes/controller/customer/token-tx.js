var Web3 = require('web3');
var web3 = new Web3();
const wsappress = 'ws://crypto-testnets.sofodev.co:38547'
var web3 = new Web3(new Web3.providers.WebsocketProvider(wsappress));


var abi = [ { "anonymous": false, "inputs": [ { "indexed": true, "name": "tokenOwner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "tokens", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }, { "name": "_extraData", "type": "bytes" } ], "name": "approveAndCall", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_value", "type": "uint256" } ], "name": "burn", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_freeze", "type": "bool" } ], "name": "emergencyFreezeAllAccounts", "outputs": [ { "name": "res", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_target", "type": "address" }, { "name": "_freeze", "type": "bool" } ], "name": "freezeAccount", "outputs": [ { "name": "res", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "tokens", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "emergencyFreezeStatus", "type": "bool" } ], "name": "EmerygencyFreezed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "targetAddress", "type": "address" }, { "indexed": false, "name": "frozen", "type": "bool" } ], "name": "Freezed", "type": "event" }, { "constant": false, "inputs": [ { "name": "_tokenAddress", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferAnyERC20Token", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "Burn", "type": "event" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "constant": true, "inputs": [ { "name": "_tokenOwner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_tokenOwner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "emergencyFreeze", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_targetAddress", "type": "address" } ], "name": "isFreezed", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ]

let address = '0xfd701e4dcc9d3ec09e5e720d4ff5de157d734dca' // private -Net

let contractInstance =  new web3.eth.Contract(abi, address);

var pastTransferEvents = contractInstance.getPastEvents('Transfer', {}, {fromBlock: 3853990, toBlock:'latest'})


pastTransferEvents.then((events) => {
console.log('hiiiii', events.length)
  console.log(events)
  events.forEach((e)=>{
    let result = e.returnValues;
    console.log("Block Number", e.blockNumber);
    console.log("tx hash", e.transactionHash);
    console.log('sender', result.from)
    console.log('recipient', result.to)
    console.log('amount', result.tokens)
    console.log("\n");    
  })
/*  for(let i=0; i< events.length; i++){
    let result = events[i].returnValues
    console.log("Block Number", events[i].blockNumber);
    console.log("tx hash", events[i].transactionHash);
    console.log('sender', result.from)
    console.log('recipient', result.to)
    console.log('amount', result.tokens)
    console.log("\n");
  }*/
  process.exit(1)
})

/*
Response of events
[ { address: '0x72576Bf9f96165381231ba65B803540ACBB23230',
    blockNumber: 200,
    transactionHash: '0xbe76a89ef88f6682d132ff765b757a8cdcfa1d1a3f72c1890aef4581367b3b7c',
    transactionIndex: 0,
    blockHash: '0xf4d9c5e63c28ca8d7ff3a2be34620cc8140f8c13d10ba34073322dcca73bbb34',
    logIndex: 0,
    removed: false,
    id: 'log_732281d2',
    returnValues: 
     Result {
       '0': '0x0E37Fb8dFF427f5a2ed75D311e818E1Eab924a74',
       '1': '0x693732204104A6e0e636844C85e021d25306A6Cc',
       '2': '16',
       from: '0x0E37Fb8dFF427f5a2ed75D311e818E1Eab924a74',
       to: '0x693732204104A6e0e636844C85e021d25306A6Cc',
       tokens: '16' },
    event: 'Transfer',
    signature: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    raw: 
     { data: '0x0000000000000000000000000000000000000000000000000000000000000010',
       topics: [Array] } },
  { address: '0x72576Bf9f96165381231ba65B803540ACBB23230',
    blockNumber: 208,
    transactionHash: '0x57d09b85455836139672e55e4e91d79d160023fcb5f13436f0669e8025ddd6e2',
    transactionIndex: 0,
    blockHash: '0x8adbc2d9fc3d487d436c18e1be94c1874f759c592abff9c346dde87bc8f9cad4',
    logIndex: 0,
    removed: false,
    id: 'log_3824029d',
    returnValues: 
     Result {
       '0': '0x0E37Fb8dFF427f5a2ed75D311e818E1Eab924a74',
       '1': '0x6eff1193545f1234afe5069D9bdE071Bc10D18CD',
       '2': '12',
       from: '0x0E37Fb8dFF427f5a2ed75D311e818E1Eab924a74',
       to: '0x6eff1193545f1234afe5069D9bdE071Bc10D18CD',
       tokens: '12' },
    event: 'Transfer',
    signature: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    raw: 
     { data: '0x000000000000000000000000000000000000000000000000000000000000000c',
       topics: [Array] } } ]*/