import "dotenv/config";
import axios from "axios";
import https from 'node:https'

const baseURL = "https://api.themoviedb.org/3";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  httpAgent: new https.Agent({
    family: 4
  })
});

api.interceptors.request.use((config) => {
  config.headers.set("Authorization", `Bearer ${process.env.TMDB_API_KEY}`);
  config.headers.set("Content-Type", 'application/json');

  return config;
});
