import { NextRequest, NextResponse } from 'next/server';

const mockCryptos = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 42500,
    change24h: 2.5,
    change7d: 5.2,
    marketCap: 850000000000,
    volume24h: 25000000000,
    rank: 1,
    volatility: 3.2,
    difficulty: 'easy',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2250,
    change24h: 1.8,
    change7d: 4.1,
    marketCap: 270000000000,
    volume24h: 12000000000,
    rank: 2,
    volatility: 4.1,
    difficulty: 'medium',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.95,
    change24h: -1.2,
    change7d: 2.3,
    marketCap: 35000000000,
    volume24h: 800000000,
    rank: 3,
    volatility: 5.5,
    difficulty: 'medium',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 185,
    change24h: 3.2,
    change7d: 8.5,
    marketCap: 85000000000,
    volume24h: 3500000000,
    rank: 4,
    volatility: 6.2,
    difficulty: 'hard',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    price: 2.15,
    change24h: 0.8,
    change7d: 3.2,
    marketCap: 120000000000,
    volume24h: 2500000000,
    rank: 5,
    volatility: 4.8,
    difficulty: 'medium',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/44/large/xrp.png',
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    price: 8.5,
    change24h: -0.5,
    change7d: 1.8,
    marketCap: 12000000000,
    volume24h: 450000000,
    rank: 6,
    volatility: 5.2,
    difficulty: 'medium',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.38,
    change24h: 4.2,
    change7d: 12.5,
    marketCap: 56000000000,
    volume24h: 1200000000,
    rank: 7,
    volatility: 7.1,
    difficulty: 'hard',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  },
  {
    id: 'litecoin',
    symbol: 'LTC',
    name: 'Litecoin',
    price: 95,
    change24h: 1.5,
    change7d: 3.8,
    marketCap: 15000000000,
    volume24h: 800000000,
    rank: 8,
    volatility: 4.5,
    difficulty: 'medium',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    price: 28.5,
    change24h: 2.1,
    change7d: 5.3,
    marketCap: 14000000000,
    volume24h: 650000000,
    rank: 9,
    volatility: 5.8,
    difficulty: 'medium',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  },
  {
    id: 'uniswap',
    symbol: 'UNI',
    name: 'Uniswap',
    price: 18.2,
    change24h: -1.8,
    change7d: 2.1,
    marketCap: 11000000000,
    volume24h: 520000000,
    rank: 10,
    volatility: 6.5,
    difficulty: 'hard',
    timestamp: new Date().toISOString(),
    logo: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '500');
    const page = parseInt(searchParams.get('page') || '1');

    console.log('🎯 Returning mock cryptocurrencies');

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedData = mockCryptos.slice(startIdx, endIdx);

    const data = {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: mockCryptos.length,
        pages: Math.ceil(mockCryptos.length / limit),
      },
    };

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('❌ Crypto API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cryptocurrencies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
