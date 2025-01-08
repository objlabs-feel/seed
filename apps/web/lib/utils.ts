export const convertBigIntToString = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
    }

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'bigint') {
            return [key, value.toString()];
        } else if (typeof value === 'object') {
            return [key, convertBigIntToString(value)];
        } else {
            return [key, value];
        }
        })
    );
}