import { Request, Response } from "express";
import {
  CREATE_TRANSACTION,
  CREATE_USER,
  GET_BALANCE,
  GET_FULL_CHAIN,
} from "../actions/constants";
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
      const balance = await getSocketInfo(port, host, action);
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

export const getAllChain = async (req: RequestBalance, res: Response) => {
  try {
    const addresses = await getAddresses();
    const data = {};

    const action = {
      type: GET_FULL_CHAIN,
    } as const;

    for (const { host, port } of addresses) {
      const fullChian = await getSocketInfo(port, host, action);
      data[`${host}:${port}`] = JSON.parse(fullChian);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const [address] = await getAddresses();

    const action = {
      type: CREATE_USER,
    } as const;

    const user = await getSocketInfo(address.port, address.host, action);

    res.status(201).json({
      user: JSON.parse(user),
    });
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { address, privateKey, recipient, value } = req.body;

    const addresses = await getAddresses();
    const action = {
      type: CREATE_TRANSACTION,
      address,
      privateKey,
      recipient,
      value,
      addresses,
    } as const;

    let data = {};

    for (const { host, port } of addresses) {
      const transaction = await getSocketInfo(port, host, action);
      data[`${host}:${port}`] = JSON.parse(transaction);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};
