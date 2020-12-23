const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// TIMESTAMP format should be EEE MMM d HH:mm:ss z yyyy in english
export const getCognitoTimestamp = () => {
  const now = new Date();

  const day = days[now.getUTCDay()];
  const mon = months[now.getUTCMonth()];
  const dayOfMonth = now.getUTCDate();

  const hours = `${now.getUTCHours()}`.padStart(2, '0');
  const mins = `${now.getUTCMinutes()}`.padStart(2, '0');
  const secs = `${now.getUTCSeconds()}`.padStart(2, '0');
  const year = now.getUTCFullYear();

  return `${day} ${mon} ${dayOfMonth} ${hours}:${mins}:${secs} UTC ${year}`;
};
