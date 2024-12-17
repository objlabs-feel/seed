import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auctionItemId = parseInt(params.id)
    const { user_id, value } = await request.json()

    const history = await prisma.auctionItemHistory.create({
      data: {
        auction_item_id: auctionItemId,
        user_id: BigInt(user_id),
        value
      }
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('입찰 처리 중 오류:', error)
    return NextResponse.json(
      { error: '입찰 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 