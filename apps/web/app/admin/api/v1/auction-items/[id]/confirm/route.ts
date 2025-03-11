import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
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
        seller_steps: 3
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
    console.error('Error updating seller steps:', error);
    return NextResponse.json(
      { error: 'Failed to update seller steps' },
      { status: 500 }
    );
  }
}
