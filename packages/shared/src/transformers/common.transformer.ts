/**
 * 공통 transformer 유틸리티 함수들
 */

/**
 * bigint를 string으로 변환
 */
export function bigintToString(value: bigint | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value.toString();
}

/**
 * Date를 ISO string으로 변환
 */
export function dateToString(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * 기본 모델 필드들을 BaseResponseDto 형태로 변환
 */
export function transformBaseFields(model: {
  id: bigint | number;
  created_at?: Date | null;
  updated_at?: Date | null;
  status: number | null;
}) {
  return {
    id: bigintToString(model.id)!,
    created_at: dateToString(model.created_at),
    updated_at: dateToString(model.updated_at),
    status: model.status,
  };
}

/**
 * 객체가 존재하는 경우에만 transformer 함수를 적용
 */
export function transformIfExists<T, R>(value: T | null | undefined, transformer: (value: T) => R): R | undefined {
  return value ? transformer(value) : undefined;
}

export function transformIfExistsWithType<T, R>(
  value: T | null | undefined,
  transformers: { [key: string]: (value: any) => any }
): R | undefined {
  if (!value) return undefined;

  const type = (value as any).constructor?.name;
  if (!type || !transformers[type]) {
    console.warn(`No transformer found for type: ${type}`);
    return undefined;
  }

  try {
    return transformers[type](value) as R;
  } catch (error) {
    console.error(`Error transforming value of type ${type}:`, error);
    return undefined;
  }
}

/**
 * 배열의 각 요소에 transformer 함수를 적용
 */
export function transformArray<T, R>(
  array: T[] | null | undefined,
  transformer: (value: T) => R
): R[] | undefined {
  return array?.map(transformer);
}

/**
 * 민감한 필드들을 제거
 */
export function omitSensitiveFields<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

export function transformByType<T, R>(value: T | null | undefined, typeCheck: (value: T) => boolean, transformer: (value: T) => R): R | undefined {
  return value && typeCheck(value) ? transformer(value) : undefined;
}