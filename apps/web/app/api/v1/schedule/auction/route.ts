import { NextResponse } from 'next/server';
import { updateExpiredAuctions } from '@/lib/schedule/auction';

export async function GET(request: Request) {
  try {
    // API 키 확인
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 });
    }

    // 만료된 경매 업데이트
    const result = await updateExpiredAuctions();

    // 결과 로깅 (CloudWatch에서 확인 가능)
    console.log(`업데이트 완료: ${result.updatedCount}개 경매 상품 처리됨`);

    return NextResponse.json({
      success: true,
      updated: result.updatedCount,
      message: '경매 상품 업데이트 완료'
    });
  } catch (error) {
    console.error('경매 업데이트 오류:', error);
    return NextResponse.json({
      error: '경매 업데이트 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}