export const readingTime = (articleText) => {
    const wordsArray = articleText.split(' ');
    // Count the number of words in the array
    const wordCount = wordsArray.length;
    // Calculate the estimated reading time
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
}

export function truncateTitle(input, value) {
  if (input.length > value) {
     return input.substring(0, value) + '...';
  }
  return input;
};


export function formatDate(date) {
    const [day, month, year] = date.split('/').map(num => parseInt(num, 10));
    
    const options = { year: 'numeric', month: 'long'};//,day: 'numeric'
    
    // Add suffix to day (st, nd, rd, th)
    const suffix = (day) => {
      if (day > 3 && day < 21) return 'th'; // Special case for 11th-13th
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    const dateObj = new Date(year, month - 1, day);
    return `${day}${suffix(day)} ${dateObj.toLocaleString('en-GB', options)}`;
}
