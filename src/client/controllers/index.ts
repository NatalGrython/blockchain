import { Request, Response } from "express";
import { GET_BALANCE } from "../actions/constants";
import { getAddresses, getSocketInfo } from "../utils";

type ParamsDictionary = { [key: string]: string };
type RequestBody = { address?: string };
type RequestBalance = Request<ParamsDictionary, any, RequestBody>;

export const getBalance = async (req: RequestBalance, res: Response) => {
  const { address } = req.body;

  if (!address) {
    res.status(400).json({
      error: "Not address",
    });
  }
  try {
    const addresses = await getAddresses();
    const data = {};

    const action = {
      type: GET_BALANCE,
      address,
    } as const;

    for (const { host, port } of addresses) {
      const balance = await getSocketInfo<string>(port, host, action);
      data[`${host}:${port}`] = balance;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};
