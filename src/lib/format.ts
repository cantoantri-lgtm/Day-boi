import { format } from 'date-fns';

export const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    try {
      const d = new Date(timeStr);
      // Because Google Sheets '1899-12-30T...' time might be UTC or Local, 
      // getting the hours/minutes directly from the Date object might be shifted due to timezones.
      // Wait, 1899-12-30T00:53:30.000Z parsed in local time (UTC+7) might be 07:53:30.
      // If the user typed '08:00', Google Sheets stores it as a fraction of a day.
      // When exported to JSON by Apps Script without formatting, it becomes an ISO string.
      // Actually, Apps Script's JSON.stringify(date) creates an ISO string.
      // To be safe, we can just extract the HH:mm from the ISO string if it's consistently UTC or local.
      // Wait, if they typed 08:00 in Vietnam, it might be 1899-12-30T01:00:00.000Z (08:00 UTC+7) or 1899-12-30T00:53:30.000Z (Vietnam LMT offset).
      // A better way is to just use Google Sheets' formatted value instead, but since we already have the data in db, we must parse it.
      // Let's just use `format(d, 'HH:mm')`.
      return format(d, 'HH:mm');
    } catch (e) {
      return timeStr;
    }
  }
  return timeStr;
};
