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
        status: 2
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