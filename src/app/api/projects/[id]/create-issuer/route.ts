import { NextRequest, NextResponse } from 'next/server';
import { createIssuerAccount, getIssuerAccount } from '@/lib/services/issuerAccounts';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    
    
    // Check if issuer already exists
    const existingIssuerResult = await getIssuerAccount(projectId);
    
    if (existingIssuerResult.account) {
      
      return NextResponse.json({
        message: 'Issuer account already exists',
        issuer: {
          publicKey: existingIssuerResult.account.public_key,
          isFunded: existingIssuerResult.account.is_funded,
          isActive: existingIssuerResult.account.is_active,
        }
      }, { status: 200 });
    }
    
    
    
    // Create new issuer account
    const result = await createIssuerAccount(projectId);
    
    if (result.error || !result.publicKey) {
      
      return NextResponse.json(
        { error: result.error || 'Failed to create issuer account' },
        { status: 500 }
      );
    }
    
    
    
    return NextResponse.json({
      message: 'Issuer account created successfully',
      issuer: {
        publicKey: result.publicKey,
      }
    }, { status: 201 });
    
  } catch (error) {
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
