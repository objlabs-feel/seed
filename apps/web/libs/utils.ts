export const convertBigIntToString = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString(); // Date 객체를 ISO 문자열로 변환
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'bigint') {
        return [key, value.toString()];
      } else if (value instanceof Date) {
        return [key, value.toISOString()]; // Date 객체를 ISO 문자열로 변환
      } else if (typeof value === 'object') {
        return [key, convertBigIntToString(value)];
      } else {
        return [key, value];
      }
    })
  );
};