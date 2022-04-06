import { PORT } from "../../constants/system";
import { request } from "http";

export const sendRequest = (data: any) => {
  let sendData = data;
  if (typeof data !== "string") {
    sendData = JSON.stringify(data);
  }
  const req = request({
    method: "POST",
    host: "localhost",
    port: PORT,
    path: "/event",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": sendData.length,
    },
  });

  req.write(sendData);
  req.end();
};
