import { NextResponse } from 'next/server';
import { productService, CreateProductRequestDto } from '@repo/shared/services';

// 목록 조회
export async function GET() {
  try {
    const products = await productService.findMany();
    return NextResponse.json(products);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching products: ${errorMessage}`);
    return NextResponse.json(
      { error: '제품 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 신규 등록
export async function POST(request: Request) {
  try {
    const body: CreateProductRequestDto = await request.json();
    const newProduct = await productService.create(body);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating product: ${errorMessage}`);
    return NextResponse.json(
      { error: '제품 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
