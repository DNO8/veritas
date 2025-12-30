import { NextRequest, NextResponse } from 'next/server';
import { toggleBenefitStatus } from '@/lib/services/benefits';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { benefit, error } = await toggleBenefitStatus(id);
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    
    return NextResponse.json({ benefit }, { status: 200 });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
