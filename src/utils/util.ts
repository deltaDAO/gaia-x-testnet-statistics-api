/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true
  } else if (typeof value !== 'number' && value === '') {
    return true
  } else if (typeof value === 'undefined' || value === undefined) {
    return true
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true
  } else {
    return false
  }
}

export function getValueAsArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

export function getDateFromUnixTimestamp(unixTimestamp: number): Date {
  return new Date(unixTimestamp * 1000)
}
