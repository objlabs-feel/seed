import { NextRequest, NextResponse } from 'next/server';
import {
  salesTypeService,
  CreateSalesTypeRequestDto,
} from '@repo/shared/services';

/**
 * GET /admin/api/v1/sales-types
 * 판매 유형 목록을 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const salesTypes = await salesTypeService.findMany({
      orderBy: { sort_key: 'asc' },
    });
    return NextResponse.json(salesTypes);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching sales types: ${errorMessage}`);
    return NextResponse.json(
      { error: '판매 유형 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /admin/api/v1/sales-types
 * 새로운 판매 유형을 생성합니다.
 */
export async function POST(request: Request) {
  try {
    const body: CreateSalesTypeRequestDto = await request.json();
    const newSalesType = await salesTypeService.create(body);
    return NextResponse.json(newSalesType, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating sales type: ${errorMessage}`);
    return NextResponse.json(
      { error: '판매 유형 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 