"use strict";

(async () => {
    const supported_chains = [1, 42];
    const XHT_addresses = {
        1: '0xa0DDAa9779a3F237095338b6546aABaAD7AbeaeE',
        42: '0x7bF904B8C6A0a402aDAD465a2E9b606aeB1E52b0',
    };
    const XHT_ABI = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"}],"name":"deprecate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deprecated","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"last_mint_block","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"}],"name":"transfer_ownership","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
    const Exchange_addresses = {
        1: '0x310f4934923d30De01d1374D7F00e70C896D32F2',
        42: '0x3D8523eacb6673B60A568dB050F917da34B4370c',
    };
    const Exchange_ABI = JSON.parse('[{"inputs":[],"name":"buy","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"buy_price","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"xht_value","type":"uint256"}],"name":"sell","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sell_price","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"start_block","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}]');
    if (!window.ethereum) {
        alert('未检测到以太坊客户端');
        return;
    }
    window.ethereum.autoRefreshOnNetworkChange = false;
    try {
        await window.ethereum.enable();
    } catch (e) {
        alert('未成功连接以太坊客户端（' + e + '）');
        return;
    }
    window.ethereum.on('chainChanged', () => {location.reload()});
    window.ethereum.on('networkChanged', () => {location.reload()});
    window.ethereum.on('accountsChanged', () => {location.reload()});
    const web3 = new Web3(window.ethereum);
    const chain_id = await web3.eth.getChainId();
    if (!supported_chains.includes(chain_id)) {
        alert('请切换到以太坊主网');
        return;
    }
    const XHT_address = XHT_addresses[chain_id];
    const XHT = new web3.eth.Contract(XHT_ABI, XHT_address);
    const Exchange_address = Exchange_addresses[chain_id];
    const Exchange = new web3.eth.Contract(Exchange_ABI, Exchange_address);
    const account = (await web3.eth.getAccounts())[0];
    const data = {
        chain_id,
        XHT_address,
        Exchange_address,
        account,
        buy_eth_input: 0,
        sell_xht_input: 0,
        new_allowance_input: 0,
    };
    async function refresh() {
        await Promise.all([
            web3.eth.getBalance(account)
                .then((r) => {data.my_eth = parseInt(r)}),
            XHT.methods.balanceOf(account).call()
                .then((r) => {data.my_xht = parseInt(r)}),
            Exchange.methods.buy_price().call()
                .then((r) => {data.buy_price = parseInt(r)}),
            Exchange.methods.sell_price().call()
                .then((r) => {data.sell_price = parseInt(r)}),
            web3.eth.getBalance(Exchange_address)
                .then((r) => {data.exchange_eth = parseInt(r)}),
            XHT.methods.balanceOf(Exchange_address).call()
                .then((r) => {data.exchange_xht = parseInt(r)}),
            XHT.methods.allowance(account, Exchange_address).call()
                .then((r) => {data.allowance = parseInt(r)}),
        ]);
    };
    await refresh();
    web3.eth.subscribe('newBlockHeaders', refresh);
    new Vue({
        el: '#app',
        data,
        computed: {
            sell_price_future: () => data.sell_price + 1e7 * 120,
            buy_eth: () => Math.round(data.buy_eth_input * 1e18),
            sell_xht: () => Math.round(data.sell_xht_input * 1e4),
            new_allowance: () => Math.round(data.new_allowance_input * 1e4),
        },
        methods: {
            v_xht: (v) => (v * 1e-4).toFixed(4) + ' XHT',
            v_eth: (v) => (v * 1e-18).toFixed(6) + ' ETH',
            buy() {
                Exchange.methods.buy()
                    .send({from: account, value: this.buy_eth});
            },
            approve() {
                XHT.methods.approve(Exchange_address, this.new_allowance)
                    .send({from: account});
            },
            sell() {
                Exchange.methods.sell(this.sell_xht)
                    .send({from: account});
            },
        },
    });
})().catch((e) => {
    console.error(e);
    alert(e);
});
