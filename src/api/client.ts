import axios from "axios";

export const nytClient = axios.create({
  baseURL: "https://api.nytimes.com/svc",
});
