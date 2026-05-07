import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch real prices from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,solana,polkadot,matic-network,avalanche-2,chainlink,uniswap&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false',
      {
        headers: {
          'Accept': 'application/json',
        },
        // Cache for 30 seconds
        next: { revalidate: 30 }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Map CoinGecko response to our format
    const prices = {
      BTC: data.bitcoin?.usd || 42500,
      ETH: data.ethereum?.usd || 2300,
      BNB: data.binancecoin?.usd || 620,
      ADA: data.cardano?.usd || 1.05,
      SOL: data.solana?.usd || 210,
      DOT: data.polkadot?.usd || 9.50,
      MATIC: data['matic-network']?.usd || 0.85,
      AVAX: data['avalanche-2']?.usd || 38,
      LINK: data.chainlink?.usd || 28,
      UNI: data.uniswap?.usd || 12.50,
    };

    return NextResponse.json(prices, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching crypto prices:', error);

    // Return fallback prices if API fails
    const fallbackPrices = {
      BTC: 42500,
      ETH: 2300,
      BNB: 620,
      ADA: 1.05,
      SOL: 210,
      DOT: 9.50,
      MATIC: 0.85,
      AVAX: 38,
      LINK: 28,
      UNI: 12.50,
    };

    return NextResponse.json(fallbackPrices, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }
}
