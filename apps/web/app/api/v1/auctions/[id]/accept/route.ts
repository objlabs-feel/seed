import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertBigIntToString } from '@/lib/utils';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auctionItem = await prisma.auctionItem.update({
      where: {
        id: BigInt(params.id)
      },
      data: {
        buyer_steps: 4,
        seller_steps: 4
      },
      include: {
        medical_device: {
          include: {
            company: {
              include: {
                profile: true,
              }
            },
            department: true,
            deviceType: true,
            manufacturer: true
          }
        },
        auction_item_history: true
      }
    });

    return NextResponse.json(convertBigIntToString(auctionItem));
  } catch (error) {
    console.error('Error updating auction status:', error);
    return NextResponse.json(
      { error: 'Failed to update auction status' },
      { status: 500 }
    );
  }
}
