import { NextRequest, NextResponse } from 'next/server';

const mockMatches = [
  {
    fixture_id: 1,
    home_team_id: 1,
    home_team: 'Manchester United',
    home_team_logo: null,
    away_team_id: 2,
    away_team: 'Liverpool',
    away_team_logo: null,
    league_id: 1,
    league_name: 'Premier League',
    league_logo: null,
    match_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    venue_name: 'Old Trafford',
    status: 'NS',
    home_odds: 2.1,
    draw_odds: 3.2,
    away_odds: 3.5,
    over_25_odds: 1.9,
    under_25_odds: 1.95,
    btts_yes_odds: 1.8,
    btts_no_odds: 2.0,
    over_35_odds: 2.5,
    under_35_odds: 1.55,
    ht_home_odds: 1.95,
    ht_draw_odds: 3.4,
    ht_away_odds: 3.8,
  },
  {
    fixture_id: 2,
    home_team_id: 3,
    home_team: 'Arsenal',
    home_team_logo: null,
    away_team_id: 4,
    away_team: 'Chelsea',
    away_team_logo: null,
    league_id: 1,
    league_name: 'Premier League',
    league_logo: null,
    match_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    venue_name: 'Emirates Stadium',
    status: 'NS',
    home_odds: 1.95,
    draw_odds: 3.3,
    away_odds: 3.8,
    over_25_odds: 2.0,
    under_25_odds: 1.9,
    btts_yes_odds: 1.85,
    btts_no_odds: 1.95,
    over_35_odds: 2.6,
    under_35_odds: 1.5,
    ht_home_odds: 1.9,
    ht_draw_odds: 3.5,
    ht_away_odds: 4.0,
  },
  {
    fixture_id: 3,
    home_team_id: 5,
    home_team: 'Manchester City',
    home_team_logo: null,
    away_team_id: 6,
    away_team: 'Tottenham',
    away_team_logo: null,
    league_id: 1,
    league_name: 'Premier League',
    league_logo: null,
    match_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    venue_name: 'Etihad Stadium',
    status: 'NS',
    home_odds: 1.65,
    draw_odds: 3.8,
    away_odds: 5.0,
    over_25_odds: 2.1,
    under_25_odds: 1.85,
    btts_yes_odds: 1.75,
    btts_no_odds: 2.1,
    over_35_odds: 2.7,
    under_35_odds: 1.45,
    ht_home_odds: 1.7,
    ht_draw_odds: 3.9,
    ht_away_odds: 5.2,
  },
  {
    fixture_id: 4,
    home_team_id: 7,
    home_team: 'Real Madrid',
    home_team_logo: null,
    away_team_id: 8,
    away_team: 'Barcelona',
    away_team_logo: null,
    league_id: 2,
    league_name: 'La Liga',
    league_logo: null,
    match_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    venue_name: 'Santiago Bernabéu',
    status: 'NS',
    home_odds: 2.0,
    draw_odds: 3.4,
    away_odds: 3.6,
    over_25_odds: 1.95,
    under_25_odds: 1.95,
    btts_yes_odds: 1.82,
    btts_no_odds: 1.98,
    over_35_odds: 2.55,
    under_35_odds: 1.52,
    ht_home_odds: 1.92,
    ht_draw_odds: 3.6,
    ht_away_odds: 3.9,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('🎯 Returning mock football fixtures');

    const matches = mockMatches.slice(0, limit);

    return NextResponse.json({
      success: true,
      matches,
      total: matches.length,
      message: 'Upcoming fixtures fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch fixtures',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 