import { NextRequest, NextResponse } from 'next/server';
import { getIssuerAccount } from '@/lib/services/issuerAccounts';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    const result = await getIssuerAccount(projectId);
    
    if (result.error || !result.account) {
      return NextResponse.json(
        { error: result.error || 'Issuer account not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      issuerPublicKey: result.account.public_key,
      isFunded: result.account.is_funded,
      isActive: result.account.is_active,
    }, { status: 200 });
    
  } catch (error) {
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
