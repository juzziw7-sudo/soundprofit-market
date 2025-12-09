// Web3 Integration for SoundProfit Market
// Handles blockchain payments and commission routing

class Web3Integration {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contract = null;
        this.adminWallet = '0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402';
        this.contractAddress = null; // Set after deployment
        this.contractABI = [
            {
                "inputs": [
                    { "internalType": "uint256", "name": "songId", "type": "uint256" },
                    { "internalType": "address payable", "name": "artist", "type": "address" }
                ],
                "name": "buyLicense",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
                    { "indexed": true, "internalType": "uint256", "name": "songId", "type": "uint256" },
                    { "indexed": true, "internalType": "address", "name": "artist", "type": "address" },
                    { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
                ],
                "name": "LicenseSold",
                "type": "event"
            }
        ];
    }

    // Initialize Web3 and connect wallet
    async init() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not installed. Please install MetaMask to use blockchain payments.');
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            this.account = accounts[0];

            // Initialize Web3
            this.web3 = new Web3(window.ethereum);

            // Load contract if address is set
            if (this.contractAddress) {
                this.contract = new this.web3.eth.Contract(
                    this.contractABI,
                    this.contractAddress
                );
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                this.account = accounts[0];
                this.onAccountChanged(accounts[0]);
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            return this.account;
        } catch (error) {
            console.error('Web3 initialization failed:', error);
            throw error;
        }
    }

    // Connect wallet
    async connectWallet() {
        try {
            const account = await this.init();
            ui.showToast(`Wallet connected: ${this.formatAddress(account)}`, 'success');
            return account;
        } catch (error) {
            ui.showToast('Failed to connect wallet: ' + error.message, 'error');
            return null;
        }
    }

    // Purchase song with blockchain payment
    async purchaseSong(songId, artistWallet, priceUSD) {
        if (!this.account) {
            await this.connectWallet();
        }

        if (!this.contract) {
            // Fallback to direct transfer if contract not deployed
            return await this.directTransfer(artistWallet, priceUSD);
        }

        try {
            ui.showLoading();

            // Convert USD to ETH (simplified - in production use oracle)
            const ethPrice = await this.getETHPrice();
            const priceETH = (priceUSD / ethPrice).toFixed(6);
            const priceWei = this.web3.utils.toWei(priceETH, 'ether');

            console.log(`Purchasing song #${songId} for ${priceETH} ETH ($${priceUSD})`);

            // Call smart contract
            const tx = await this.contract.methods
                .buyLicense(songId, artistWallet)
                .send({
                    from: this.account,
                    value: priceWei,
                    gas: 200000
                });

            ui.hideLoading();

            // Record transaction in backend
            await this.recordTransaction(tx.transactionHash, songId, priceETH, priceUSD);

            ui.showToast('Purchase successful! 🎉', 'success');

            return {
                success: true,
                txHash: tx.transactionHash,
                blockNumber: tx.blockNumber
            };

        } catch (error) {
            ui.hideLoading();
            console.error('Purchase failed:', error);
            ui.showToast('Purchase failed: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    // Direct transfer (fallback if contract not deployed)
    async directTransfer(artistWallet, priceUSD) {
        try {
            ui.showLoading();

            const ethPrice = await this.getETHPrice();
            const priceETH = (priceUSD / ethPrice).toFixed(6);
            const priceWei = this.web3.utils.toWei(priceETH, 'ether');

            // Calculate commission (2%)
            const commissionWei = Math.floor(priceWei * 0.02);
            const artistShareWei = priceWei - commissionWei;

            // Send to artist (98%)
            const artistTx = await this.web3.eth.sendTransaction({
                from: this.account,
                to: artistWallet,
                value: artistShareWei.toString()
            });

            // Send commission to admin (2%)
            const commissionTx = await this.web3.eth.sendTransaction({
                from: this.account,
                to: this.adminWallet,
                value: commissionWei.toString()
            });

            ui.hideLoading();
            ui.showToast('Purchase successful! Commission sent to platform.', 'success');

            return {
                success: true,
                artistTxHash: artistTx.transactionHash,
                commissionTxHash: commissionTx.transactionHash
            };

        } catch (error) {
            ui.hideLoading();
            console.error('Direct transfer failed:', error);
            ui.showToast('Transfer failed: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    // Get current ETH price in USD (simplified)
    async getETHPrice() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            return data.ethereum.usd;
        } catch (error) {
            console.warn('Failed to fetch ETH price, using fallback');
            return 2000; // Fallback price
        }
    }

    // Record transaction in backend
    async recordTransaction(txHash, songId, priceETH, priceUSD) {
        try {
            await api.request('/blockchain/record', 'POST', {
                tx_hash: txHash,
                song_id: songId,
                amount_eth: priceETH,
                amount_usd: priceUSD,
                buyer_address: this.account
            });
        } catch (error) {
            console.error('Failed to record transaction:', error);
        }
    }

    // Get wallet balance
    async getBalance() {
        if (!this.account) return '0';

        const balanceWei = await this.web3.eth.getBalance(this.account);
        const balanceETH = this.web3.utils.fromWei(balanceWei, 'ether');
        return parseFloat(balanceETH).toFixed(4);
    }

    // Get admin wallet balance (for commission tracking)
    async getAdminBalance() {
        if (!this.web3) await this.init();

        const balanceWei = await this.web3.eth.getBalance(this.adminWallet);
        const balanceETH = this.web3.utils.fromWei(balanceWei, 'ether');
        return parseFloat(balanceETH).toFixed(4);
    }

    // Format address for display
    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    }

    // Event callback for account changes
    onAccountChanged(newAccount) {
        console.log('Account changed to:', newAccount);
        if (state.user) {
            state.user.eth_wallet = newAccount;
            updateAuthUI();
        }
    }

    // Check if wallet is connected
    isConnected() {
        return this.account !== null;
    }

    // Get current network
    async getNetwork() {
        if (!this.web3) return null;
        const chainId = await this.web3.eth.getChainId();

        const networks = {
            1: 'Ethereum Mainnet',
            5: 'Goerli Testnet',
            11155111: 'Sepolia Testnet',
            137: 'Polygon Mainnet',
            80001: 'Mumbai Testnet'
        };

        return networks[chainId] || `Unknown (${chainId})`;
    }
}

// Initialize global Web3 instance
const web3Integration = new Web3Integration();

// Auto-load Web3.js library
if (typeof Web3 === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js';
    script.async = true;
    document.head.appendChild(script);
}
