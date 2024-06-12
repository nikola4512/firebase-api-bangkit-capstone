// Define "require"
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const axios = require("axios");
const BASE_URL = "http://localhost:5000";

export function thirdPartyApi(method, path) {
  const url = BASE_URL + path;
  const options = {
    method: method,
    url: url,
    // params: ,
    // headers: {
    //     "authorization":
    // }
  };
  return axios(options);
}
