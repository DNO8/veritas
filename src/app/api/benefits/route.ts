import { NextRequest, NextResponse } from 'next/server';
import { createBenefit, getBenefitsByProject } from '@/lib/services/benefits';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { benefit, error } = await createBenefit(body);
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    
    return NextResponse.json({ benefit }, { status: 201 });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }
    
    const { benefits, error } = await getBenefitsByProject(projectId);
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    
    return NextResponse.json({ benefits }, { status: 200 });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
