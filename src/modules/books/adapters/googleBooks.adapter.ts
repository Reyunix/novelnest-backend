const API_KEY = process.env.API_KEY;
const API_BASE_URL = process.env.BASE_URL;
const API_FIELD = process.env.URL_FIELD;

export const FormatUrl = (query: string) => {
  const completeUrl = `${API_BASE_URL}${API_FIELD}&q=${query}&startIndex=0&maxResults=40&printType=books&orderBy=newest&key=${API_KEY}`;
  return completeUrl;
};
