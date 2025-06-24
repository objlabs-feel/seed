/**
 * BigInt와 Number 타입 간의 변환을 처리하는 유틸리티 함수들
 * Prisma에서 사용하는 BigInt 타입과 API 응답에서 사용하는 Number 타입 간의 변환에 사용됩니다.
 */

/**
 * BigInt 값을 Number로 변환합니다.
 * @param value - 변환할 BigInt 값 (null 허용)
 * @returns 변환된 Number 값 (입력이 null이면 null 반환)
 * @example
 * ```typescript
 * const id = bigintToNumber(BigInt(123)); // 123
 * const nullId = bigintToNumber(null); // null
 * ```
 */
export function bigintToNumber(value: bigint | null): number | null {
  if (value === null) {
    return null;
  }
  return Number(value);
}

/**
 * Number 값을 BigInt로 변환합니다.
 * @param value - 변환할 Number 값 (null 허용)
 * @returns 변환된 BigInt 값 (입력이 null이면 null 반환)
 * @example
 * ```typescript
 * const id = numberToBigint(123); // BigInt(123)
 * const nullId = numberToBigint(null); // null
 * ```
 */
export function numberToBigint(value: number | null): bigint | null {
  if (value === null) {
    return null;
  }
  return BigInt(value);
} 