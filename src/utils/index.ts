import axios from 'axios';

export const request = axios.create({
  headers: { "Cache-Control": "no-cache" },
});
