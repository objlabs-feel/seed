import { NextResponse } from 'next/server';
import {
  productService,
  UpdateProductRequestDto,
} from '@repo/shared/services';

// 개별 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const product = await productService.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching product: ${errorMessage}`);
    return NextResponse.json(
      { error: '제품 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    const body: UpdateProductRequestDto = await request.json();
    const updatedProduct = await productService.update(id, body);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating product: ${errorMessage}`);
    return NextResponse.json(
      { error: '제품 수정 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    await productService.delete(id);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error deleting product: ${errorMessage}`);
    return NextResponse.json(
      { error: '제품 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
