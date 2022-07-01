import { add, differenceInMonths, differenceInCalendarWeeks, format, getWeek, getWeekYear, sub } from 'date-fns'

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

export function generateArrayOfPastMonths(numberOfMonth: number): string[] {
  const months = []
  const dateEnd = new Date()
  let dateStart = sub(dateEnd, { months: numberOfMonth })

  while (differenceInMonths(dateEnd, dateStart) >= 0) {
    months.push(format(dateStart, 'MM.yyyy'))
    dateStart = add(dateStart, { months: 1 })
  }
  return months
}

export function generateArrayOfPastWeeks(numberOfWeeks: number): string[] {
  const weeks = []
  const dateEnd = new Date()
  let dateStart = sub(dateEnd, { weeks: numberOfWeeks })

  while (differenceInCalendarWeeks(dateEnd, dateStart) >= 0) {
    weeks.push(
      `${getWeek(dateStart, {
        weekStartsOn: 1
      })}.${getWeekYear(dateStart)}`
    )
    dateStart = add(dateStart, { weeks: 1 })
  }
  return weeks
}

export function generateArrayOfPastDays(numberOfDays: number): string[] {
  const days = []
  const dateEnd = new Date()
  let dateStart = sub(dateEnd, { days: numberOfDays })

  while (differenceInCalendarWeeks(dateEnd, dateStart) >= 0) {
    days.push(format(dateStart, 'dd.MM.yyyy'))
    dateStart = add(dateStart, { days: 1 })
  }
  return days
}
