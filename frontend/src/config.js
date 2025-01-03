const getApiUrl = () => {
  // If you've set up an environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback to window.location to get the current hostname
  const hostname = window.location.hostname;
  return `http://${hostname}:3001/api`;
};

export const API_URL = getApiUrl();
