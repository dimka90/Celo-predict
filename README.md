# CeloPredict - Decentralized Prediction Markets on Celo

**CeloPredict** is a comprehensive decentralized prediction market platform built on the **Celo blockchain** with **MiniPay integration** for seamless mobile-first transactions. Predict cryptocurrency prices, sports outcomes, and custom events while earning rewards on the Celo network.

**Live Demo**: [https://celo-predict-nine.vercel.app/](https://celo-predict-nine.vercel.app/)

## 🏆 Celo MiniPay Hackathon Submission

CeloPredict is submitted to the **Celo MiniPay Hackathon** hosted by Celo Africa DAO (November 14-30, 2025). This project demonstrates innovative prediction markets leveraging Celo's mobile-first infrastructure and MiniPay for frictionless transactions.

**Hackathon Details:**
- **Event**: Celo MiniPay Hackathon 2025
- **Prize Pool**: $5,500 total
- **Category**: Prediction Markets & Games
- **Submission Status**: Active

## ✨ Key Features

### 🎯 Prediction Markets
- **Crypto Price Predictions**: Predict Bitcoin, Ethereum, and other cryptocurrency price movements
- **Sports Markets**: Football match predictions with real-time fixture data
- **Custom Markets**: Create your own prediction pools with custom odds
- **Combo Pools**: Multi-event prediction combinations for higher rewards
- **Guided Markets**: AI-assisted market creation with suggested odds

### 💰 Token & Payment System
- **Multi-Token Support**: CELO, cUSD, cEUR, and PRIX tokens
- **MiniPay Integration**: Mobile-first payments with Celo MiniPay
- **Low Fees**: Minimal transaction costs leveraging Celo's efficient consensus
- **Instant Settlements**: Fast block confirmations (~5 seconds)
- **Stablecoin Support**: Stable value predictions with cUSD/cEUR

### 🏅 Advanced Features
- **Reputation System**: User reputation tracking with tier-based permissions
- **Boost System**: Promote pools with BRONZE, SILVER, GOLD tiers
- **Liquidity Pools**: Provide liquidity and earn fees
- **Private Markets**: Whitelist-based exclusive prediction pools
- **Real-time Analytics**: Comprehensive pool statistics and user performance tracking

### 📱 Mobile-First Design
- **Responsive UI**: Optimized for mobile, tablet, and desktop
- **MiniPay Wallet**: Native integration with Celo's mobile wallet
- **Fast Loading**: Optimized performance for low-bandwidth networks
- **Offline Support**: Progressive web app capabilities

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, Heroicons, Lucide React |
| **Blockchain** | Celo (Mainnet & Alfajores Testnet) |
| **Web3** | Wagmi v2, Viem, ethers.js |
| **Wallet** | WalletConnect, MiniPay, MetaMask |
| **Smart Contracts** | Solidity, OpenZeppelin |
| **State Management** | Zustand |
| **Data Fetching** | React Query, REST APIs |
| **Deployment** | Vercel (Frontend), Celo Network (Contracts) |

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18 or higher
- **npm**, **yarn**, or **pnpm**
- **Celo Wallet**: MetaMask, MiniPay, or Trust Wallet
- **Testnet Tokens**: Get CELO from [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/celo-predict.git
cd celo-predict

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Edit .env.local with your settings:
# - RPC endpoints
# - Contract addresses
# - API keys
```

### Development

```bash
# Start development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code
npm run pretty
```

### Environment Variables

```env
# Celo Network
NEXT_PUBLIC_CELO_RPC_URL=https://alfajores-forno.celo.org
NEXT_PUBLIC_CHAIN_ID=44787

# Contract Addresses
NEXT_PUBLIC_POOL_CORE_ADDRESS=0x...
NEXT_PUBLIC_PRIX_TOKEN_ADDRESS=0x...

# API Endpoints
NEXT_PUBLIC_API_URL=https://api.example.com
```

## 📱 Application Structure

### Pages
| Page | Description |
|------|-------------|
| **Home** | Featured prediction pools and platform overview |
| **Markets** | Browse and filter all available prediction markets |
| **Create Prediction** | Intuitive pool creation interface with guided setup |
| **Crypto Markets** | Real-time cryptocurrency price predictions |
| **Profile** | User dashboard with statistics and transaction history |
| **Staking** | PRIX token staking and reward management |

### Core Components
- **Pool Cards**: Display pools with odds, liquidity, and analytics
- **Market Forms**: Guided creation for crypto, sports, and custom markets
- **Wallet Integration**: Seamless connection with MiniPay and MetaMask
- **Transaction Feedback**: Real-time transaction status and error handling
- **Analytics Dashboard**: User performance and pool statistics

## 🔧 Smart Contracts

### Core Contracts
| Contract | Purpose |
|----------|---------|
| **PredinexPoolCore** | Main prediction pool logic and settlement |
| **ReputationSystem** | User reputation tracking and tier management |
| **BoostSystem** | Pool promotion with tiered boost levels |
| **SimplePoolCreator** | Factory for creating new prediction pools |
| **PredinexStaking** | PRIX token staking and reward distribution |

### Contract Features
- ✅ **Gas Optimized**: Efficient storage patterns and computation
- ✅ **Secure**: Comprehensive validation and access controls
- ✅ **Modular**: Easy to upgrade and extend functionality
- ✅ **Auditable**: Built-in event logging for all transactions
- ✅ **Scalable**: Supports high transaction volumes

## 🌐 Deployment

### Live Application
- **Frontend**: [https://celo-predict-nine.vercel.app/](https://celo-predict-nine.vercel.app/)
- **Hosting**: Vercel (auto-deployed from main branch)
- **Performance**: Optimized for global CDN delivery

### Celo Network Configuration
| Network | Chain ID | RPC Endpoint |
|---------|----------|-------------|
| **Mainnet** | 42220 | https://forno.celo.org |
| **Alfajores Testnet** | 44787 | https://alfajores-forno.celo.org |
| **Explorer** | - | [Celo Explorer](https://explorer.celo.org) |

### Smart Contract Deployment
```bash
# Deploy to Alfajores testnet
forge script scripts/Deploy.s.sol --rpc-url $ALFAJORES_RPC_URL --broadcast

# Deploy to Celo mainnet
forge script scripts/Deploy.s.sol --rpc-url $CELO_RPC_URL --broadcast --verify
```

### Verification
- **Testnet Contracts**: Verified on [Alfajores Celoscan](https://alfajores.celoscan.io)
- **Mainnet Contracts**: Verified on [Celo Explorer](https://explorer.celo.org)

## 🔐 Security & Best Practices

### Frontend Security
- ✅ **Input Validation**: Comprehensive form validation on all user inputs
- ✅ **Error Handling**: Graceful error handling with user-friendly feedback
- ✅ **Transaction Safety**: Retry mechanisms and gas optimization
- ✅ **Wallet Security**: Secure wallet integration with proper error handling
- ✅ **Data Integrity**: Real-time data validation and intelligent caching

### Smart Contract Security
- ✅ **Access Controls**: Role-based permissions and ownership checks
- ✅ **Reentrancy Protection**: Guards against reentrancy attacks
- ✅ **Input Validation**: Comprehensive parameter validation
- ✅ **Event Logging**: All critical operations emit events for transparency

## 📊 Analytics & Monitoring

- **User Analytics**: Track user behavior and engagement metrics
- **Pool Performance**: Real-time pool statistics and performance tracking
- **Transaction Monitoring**: Monitor transaction success rates and gas usage
- **Error Tracking**: Comprehensive error logging for debugging and improvements

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes and commit (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style
- Run `npm run lint` before committing
- Ensure all tests pass
- Update documentation as needed

## 📱 MiniPay Integration

CeloPredict leverages Celo MiniPay for seamless mobile transactions:

- **Mobile-First**: Optimized for mobile wallet interactions
- **Low Fees**: Minimal transaction costs via Celo's efficient consensus
- **Fast Confirmations**: ~5 second average block time
- **Stablecoin Support**: Native cUSD and cEUR support
- **Deep Linking**: Direct transaction flows from mobile apps

### MiniPay Features
- One-click wallet connection
- Automatic transaction signing
- Real-time balance updates
- Transaction history tracking

## 🔗 Resources & Links

### Documentation
- [Celo Documentation](https://docs.celo.org/)
- [Celo MiniPay Guide](https://docs.celo.org/developer/minipay)
- [Wagmi Documentation](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)

### Tools & Services
- [Celo Explorer](https://explorer.celo.org/)
- [Alfajores Explorer](https://alfajores.celoscan.io)
- [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)
- [Celo MiniPay Hackathon](https://www.hackersdao.com/celo-minipay-hackathon)

### Community
- [Celo Discord](https://discord.com/invite/celo)
- [Celo Forum](https://forum.celo.org/)
- [Celo Twitter](https://twitter.com/CeloOrg)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ for the Celo community**

