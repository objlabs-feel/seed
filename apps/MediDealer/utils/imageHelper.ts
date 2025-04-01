/**
 * 이미지 URL 처리 유틸리티
 */

const API_BASE_URL = 'https://mediapi.objlabs.io/';

/**
 * 이미지 URL이 유효한지 확인하고 필요한 경우 수정합니다.
 * 
 * @param imageUrl 원본 이미지 URL
 * @returns 처리된 이미지 URL 또는 원본 URL
 */
export const processImageUrl = (imageUrl?: string): string | undefined => {
  if (!imageUrl) return undefined;

  try {
    // URL이 http:// 또는 https://로 시작하는지 확인
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // 이미 완전한 URL인 경우 그대로 반환
      return imageUrl;
    }

    // 상대 경로인 경우 기본 URL과 결합
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl.substring(1)}`;
    }

    // 그 외의 경우 기본 URL에 추가
    return `${API_BASE_URL}${imageUrl}`;
  } catch (error) {
    console.error('이미지 URL 처리 오류:', error);
    return imageUrl; // 오류 발생 시 원본 반환
  }
};

/**
 * 이미지 URL에 캐시 무효화 쿼리 파라미터를 추가합니다.
 * 
 * @param url 이미지 URL
 * @returns 캐시 무효화 파라미터가 추가된 URL
 */
export const addCacheBuster = (url?: string): string | undefined => {
  if (!url) return undefined;

  try {
    // 이미 쿼리 파라미터가 있는지 확인
    const hasQuery = url.includes('?');

    // 이미 타임스탬프가 있는지 확인 (t= 또는 timestamp= 파라미터)
    const hasTimestamp = url.includes('t=') || url.includes('timestamp=');
    if (hasTimestamp) {
      return url; // 이미 타임스탬프가 있으면 그대로 반환
    }

    // 앱 시작 시점 기준으로 하루에 한 번만 갱신되도록 타임스탬프 생성
    // 날짜를 YYYYMMDD 형태로 사용
    const today = new Date();
    const timestamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    return `${url}${hasQuery ? '&' : '?'}t=${timestamp}`;
  } catch (error) {
    console.error('캐시 무효화 파라미터 추가 오류:', error);
    return url;
  }
};

/**
 * 이미지 소스 객체를 생성합니다.
 * 
 * @param url 이미지 URL
 * @returns 이미지 소스 객체
 */
export const createImageSource = (url?: string) => {
  if (!url) return undefined;

  const processedUrl = processImageUrl(url);
  const cacheBustedUrl = addCacheBuster(processedUrl);

  return {
    uri: cacheBustedUrl,
    headers: {
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache'
    },
    // cache 속성은 'reload', 'default', 'force-cache', 'only-if-cached' 중 하나여야 함
    cache: 'default' as const // reload에서 default로 변경
  };
};

export default {
  processImageUrl,
  addCacheBuster,
  createImageSource
}; 