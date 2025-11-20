const convertDatetimeToLocalTimezone = (
  datetimeString: string,
  options?: Intl.DateTimeFormatOptions
) => {
  console.log('datetimeString', datetimeString);
  const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const normalized = datetimeString.replace(/(\.\d{3})\d+$/, '$1') + 'Z';
  const date = new Date(normalized);
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: clientTimeZone,
    ...options,
  });
  console.log('formatter', formatter.format(date));
  return formatter.format(date);
};

const HOUR_MS = 60 * 60 * 1000;

export const convertLocalJSTToUTC = (date: Date, hours: number): Date => {
  return new Date(date.getTime() - hours * HOUR_MS);
};

export default convertDatetimeToLocalTimezone;
