import * as moment from 'moment';

export function getStringValuesFromEnum(myEnum: any) {
  return Object.keys(myEnum).filter(k => typeof (myEnum as any)[k] === 'number') as any;
}

export default function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

export function calcDurationDays(startDate: Date, endDate: Date): number {
  let dtEnd = moment(new Date(startDate), "DD/MM/YYYY");
  let dtStart = moment(new Date(endDate), "DD/MM/YYYY");
  let diff = dtEnd.diff(dtStart, 'days');
  if (isNaN(diff)) {
    return 0;
  } else {
    return diff;
  }
}

export function getTimeAsString(date: Date) {
  return `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
}

export function getDateTimeAsString(date: Date, time: Date) {
  let newDate = moment(new Date(date), "DD/MM/YYYY");
  let newTime = moment(time, "HH:mm:ss");
  newDate.hours(newTime.hours());
  newDate.minutes(newTime.minutes());
  newDate.seconds(newTime.seconds());
  return newDate;
}

export function convertCurrency(vlDelivery: number, type: string) {
  let result=0;
  if(vlDelivery>0) {
    let vl = vlDelivery.toString();
    if(type.toLocaleUpperCase()==='US') {
      console.log('parseFloat=', parseFloat(vl).toFixed(2));
      result = parseFloat(parseFloat(vl).toFixed(2));
    } else if(type.toLocaleUpperCase()==='BR') {
      console.log('parseFloat=', parseFloat(vl).toFixed(2));
      result = parseFloat(parseFloat(vl).toFixed(2).replace(".", ","));
    }
  }
  return result;
}
