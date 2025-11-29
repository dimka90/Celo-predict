import { NextResponse } from 'next/server';

const popularCryptos = [
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
];

export async function GET() {
  try {
    console.log('🎯 Returning mock popular cryptocurrencies');

    const data = {
      success: true,
      data: popularCryptos,
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
    console.error('❌ Popular crypto API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch popular cryptocurrencies',
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
