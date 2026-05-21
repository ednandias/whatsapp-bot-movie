import "dotenv/config";
import axios from "axios";

const baseURL = "https://api.themoviedb.org/3";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  config.headers.set("Authorization", `Bearer ${process.env.TMDB_API_KEY}`);

  return config;
});
