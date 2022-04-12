import { CLIENT_PORT } from "../../constants/system";
import { request } from "http";
import axios from "axios";

export const sendRequest = (data: any) => {
  let sendData = data;
  if (typeof data !== "string") {
    sendData = JSON.stringify(data);
  }
  axios.post(`http://localhost:${CLIENT_PORT}/event`, sendData);
};
