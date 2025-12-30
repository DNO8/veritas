import { NextRequest, NextResponse } from 'next/server';
import { generateBenefitImage } from '@/lib/services/imageGeneration';

export async function POST(request: NextRequest) {
  try {
    const { title, description, benefitType, minDonation, totalSupply } = await request.json();
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const imageUrl = await generateBenefitImage(
      title, 
      description, 
      benefitType,
      minDonation,
      totalSupply
    );

    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
