import { NextResponse } from 'next/server';
import { productService, ProductSearchRequestDto } from '@repo/shared/services';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const searchOptions: ProductSearchRequestDto = {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '10', 10),
      status: searchParams.has('status')
        ? parseInt(searchParams.get('status')!, 10)
        : undefined,
      keyword: searchParams.get('keyword') || undefined,
      owner_id: searchParams.get('owner_id') || undefined,
      device_id: searchParams.get('device_id') || undefined,
      min_price: searchParams.has('min_price')
        ? parseInt(searchParams.get('min_price')!, 10)
        : undefined,
      max_price: searchParams.has('max_price')
        ? parseInt(searchParams.get('max_price')!, 10)
        : undefined,
    };

    const result = await productService().search(searchOptions);

    return NextResponse.json(result);
  } catch (error) {
    console.error('제품 검색 중 오류:', error);
    return NextResponse.json(
      { error: '제품 검색 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
