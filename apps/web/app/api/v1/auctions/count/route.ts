import { prisma } from '@repo/shared';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await prisma.auctionItem.count({});

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching auction count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction count' },
      { status: 500 }
    );
  }
}
