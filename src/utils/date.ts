import moment from 'moment-timezone';

const TIMEZONE = 'Asia/Seoul';
const FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const getTodayDate = () => moment().tz(TIMEZONE).format(FORMAT);

export const getDate = (date: string, format: string) => {
  return moment(date).tz(TIMEZONE).format(format);
};
