export const convertMinutesToHoursAndMinutes = (minutes: number) => {
  const hours = (minutes / 60) | 0;
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const formatTitle = (str: string | null) => {
  return str?.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};



  