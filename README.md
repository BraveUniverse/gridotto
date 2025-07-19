# Gridotto - Next-Generation Decentralized Lottery Platform

Gridotto is a cutting-edge decentralized lottery platform built on the LUKSO blockchain, utilizing the innovative Diamond Contract (EIP-2535) architecture for maximum flexibility and upgradeability.

## 🚀 Features

- **Diamond Contract Architecture**: Built on EIP-2535 standard for modular, upgradeable smart contracts
- **Multi-Asset Support**: Create draws with native LYX, LSP7 tokens, or LSP8 NFTs as prizes
- **Community-Driven**: Anyone can create custom lottery draws with their own rules and prizes
- **Multi-Winner Draws**: Flexible prize distribution models (winner-takes-all, tiered, equal distribution)
- **Real-Time Blockchain Data**: All data fetched directly from the blockchain
- **Modern UI**: Beautiful glassmorphic design with smooth animations
- **Fully Responsive**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **Blockchain**: LUKSO Testnet, Web3.js
- **Smart Contracts**: Diamond Pattern with multiple facets
- **UI Components**: Headless UI, Heroicons

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/gridotto.git
cd gridotto
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── draws/             # Draws listing and details
│   ├── create-draw/       # Draw creation wizard
│   ├── profile/           # User profile
│   └── about/             # About page
├── components/            # React components
│   ├── home/             # Homepage sections
│   ├── draws/            # Draw-related components
│   └── create-draw/      # Draw creation components
├── hooks/                # Custom React hooks
│   ├── useGridottoContract.ts  # Main contract interaction hook
│   └── useUPProvider.ts        # Universal Profile provider
├── config/               # Configuration files
│   └── contracts.ts      # Contract addresses and network config
└── abis/                 # Contract ABIs
    ├── GridottoFacet.json
    ├── Phase3Facet.json
    └── Phase4Facet.json
```

## 🔗 Smart Contract Architecture

Gridotto uses the Diamond Pattern (EIP-2535) with the following facets:

- **GridottoFacet**: Core lottery functionality (platform draws)
- **Phase3Facet**: User-created draws with token/NFT prizes
- **Phase4Facet**: Multi-winner draws with flexible distribution
- **AdminFacet**: Administrative functions

### Contract Addresses (LUKSO Testnet)

- Diamond Proxy: `0xYourDiamondAddress`
- GridottoFacet: `0xYourGridottoFacetAddress`
- Phase3Facet: `0xYourPhase3FacetAddress`
- Phase4Facet: `0xYourPhase4FacetAddress`

## 🎨 Design System

- **Primary Color**: #FF2975
- **Background**: Dark gradient with purple accents
- **Components**: Glassmorphic cards with blur effects
- **Typography**: Modern, clean fonts with good readability
- **Animations**: Smooth transitions and hover effects

## 🚦 Getting Started

1. **Connect Wallet**: Connect your LUKSO Universal Profile
2. **Explore Draws**: Browse active lottery draws
3. **Buy Tickets**: Purchase tickets for any active draw
4. **Create Draws**: Create your own custom lottery draws
5. **Check Profile**: View your tickets, winnings, and created draws

## 📱 Features in Detail

### Platform Draws
- Daily, Weekly, and Monthly draws
- Fixed ticket prices
- Automatic execution
- Transparent winner selection

### User-Created Draws
- Custom prize pools (tokens or NFTs)
- Set your own ticket prices
- Define participation requirements
- Choose prize distribution model

### Multi-Winner Support
- Winner-takes-all
- Tiered distribution (50/30/20, 40/30/20/10)
- Equal distribution
- Custom configurations

## 🔒 Security

- All draws executed on-chain
- Verifiable randomness for winner selection
- No central authority
- Transparent smart contracts
- Audited Diamond implementation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Website](https://gridotto.com)
- [Documentation](https://docs.gridotto.com)
- [Twitter](https://twitter.com/gridotto)
- [Discord](https://discord.gg/gridotto)

---

Built with ❤️ by the Gridotto Team
