import axios from "axios";

const BASE_URL =
  "https://sibi-feature-api-dot-capstone-1-424914.et.r.appspot.com";

export function thirdPartyApi(method, path, data = null) {
  const url = BASE_URL + path;
  const options = {
    method: method,
    url: url,
    // params: ,
    // headers: {
    //     "authorization":
    // }
    data: data,
  };
  return axios(options);
}
