import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const projectId = searchParams.get('projectId');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    let query = (supabaseServer
      .from('benefit_holdings') as any)
      .select(`
        *,
        benefit:project_benefits (
          id,
          title,
          description,
          image_url,
          asset_code,
          benefit_type,
          project_id,
          projects (
            id,
            title,
            cover_image_url
          )
        )
      `)
      .eq('holder_wallet', walletAddress);

    if (projectId) {
      query = query.eq('benefit.project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      
      return NextResponse.json(
        { error: 'Failed to fetch benefits' },
        { status: 500 }
      );
    }

    return NextResponse.json({ holdings: data || [] }, { status: 200 });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
