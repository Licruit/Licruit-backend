import moment from 'moment-timezone';

const TIMEZONE = 'Asia/Seoul';

export const getTodayDate = (format: string) => moment().utc().tz(TIMEZONE).format(format);

export const getDate = (date: string, format: string) => {
  return moment(date).tz(TIMEZONE).format(format);
};
