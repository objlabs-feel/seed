export const formatCurrency = (amount: number): string => {
  // 소수점 셋째자리까지 반올림
  const roundedAmount = Math.round(amount * 1000) / 1000;
  // 정수부와 소수부 분리
  const parts = roundedAmount.toString().split('.');
  const integerPart = parts[0] || '0';
  const decimalPart = parts[1];
  // 정수부에 천단위 콤마 추가
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // 소수부가 있으면 소수점 셋째자리까지 표시, 없으면 빈 문자열
  const formattedDecimal = decimalPart ? `.${decimalPart.padEnd(3, '0')}` : '';

  return formattedInteger + formattedDecimal + '원';
};