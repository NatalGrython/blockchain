import { Request, Response } from "express";
import {
  CREATE_TRANSACTION,
  CREATE_USER,
  GET_BALANCE,
  GET_FULL_CHAIN,
  GET_OWNER,
} from "../actions/constants";
import { getAddresses, getSocketInfo } from "../utils";

type ParamsDictionary = { [key: string]: string };
type RequestBody = { address?: string };
type RequestBalance = Request<ParamsDictionary, any, RequestBody>;

const isJSON = (message: string) => {
  try {
    JSON.parse(message);
    return true;
  } catch (error) {
    return false;
  }
};

const parseMessage = (message: string) =>
  isJSON(message) ? JSON.parse(message) : message;

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
      const abortController = new AbortController();

      setTimeout(() => {
        abortController.abort();
      }, 5000);

      const balance = await getSocketInfo(
        port,
        host,
        action,
        abortController.signal
      );
      data[`${host}:${port}`] = parseMessage(balance);
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
    const abortController = new AbortController();
    setTimeout(() => {
      abortController.abort();
    }, 5000);

    const addresses = await getAddresses();
    const data = {};

    const action = {
      type: GET_FULL_CHAIN,
    } as const;

    for (const { host, port } of addresses) {
      const fullChian = await getSocketInfo(
        port,
        host,
        action,
        abortController.signal
      );
      data[`${host}:${port}`] = parseMessage(fullChian);
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

    const abortController = new AbortController();
    setTimeout(() => {
      abortController.abort();
    }, 5000);
    const action = {
      type: CREATE_USER,
    } as const;

    const user = await getSocketInfo(
      address.port,
      address.host,
      action,
      abortController.signal
    );

    res.status(201).json({
      user: parseMessage(user),
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
      const abortController = new AbortController();
      setTimeout(() => {
        abortController.abort();
      }, 5000);
      const transaction = await getSocketInfo(
        port,
        host,
        action,
        abortController.signal
      );
      data[`${host}:${port}`] = parseMessage(transaction);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};

export const getOwner = async (req: Request, res: Response) => {
  try {
    const addresses = await getAddresses();
    const action = {
      type: GET_OWNER,
    } as const;

    let data = {};
    for (const { host, port } of addresses) {
      const abortController = new AbortController();
      setTimeout(() => {
        abortController.abort();
      }, 5000);
      const owner = await getSocketInfo(
        port,
        host,
        action,
        abortController.signal
      );
      data[`${host}:${port}`] = parseMessage(owner);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};
