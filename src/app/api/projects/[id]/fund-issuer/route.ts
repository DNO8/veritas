import { NextRequest, NextResponse } from 'next/server';
import { fundIssuerAccount } from '@/lib/services/issuerAccounts';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    
    
    const result = await fundIssuerAccount(projectId);
    
    if (!result.success) {
      
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    
    
    return NextResponse.json({
      message: 'Issuer account funded successfully',
      txHash: result.txHash
    }, { status: 200 });
    
  } catch (error) {
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
