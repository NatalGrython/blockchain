import { Request, Response } from "express";
import {
  CREATE_TRANSACTION,
  CREATE_USER,
  GET_BALANCE,
  GET_FULL_CHAIN,
  GET_OWNER,
} from "../../constants/actions";
import { SYSTEM_PORT } from "../../constants/system";
import { getSocketInfo } from "../../utils";

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

export const getBalance = async (req: Request, res: Response) => {
  const { address } = req.body;

  if (!address) {
    res.status(400).json({
      error: "Not address",
    });
  }
  try {
    const action = {
      type: GET_BALANCE,
      address,
    } as const;

    const response = await getSocketInfo(SYSTEM_PORT, "localhost", action);

    res.status(200).json(parseMessage(response));
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};

export const getAllChain = async (req: Request, res: Response) => {
  try {
    const action = {
      type: GET_FULL_CHAIN,
    } as const;

    const response = await getSocketInfo(SYSTEM_PORT, "localhost", action);

    res.status(200).json(parseMessage(response));
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const action = {
      type: CREATE_USER,
    } as const;

    const response = await getSocketInfo(SYSTEM_PORT, "localhost", action);

    res.status(201).json({
      user: parseMessage(response),
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
    const { address, privateKey, recipient, value, reason } = req.body;

    const action = {
      type: CREATE_TRANSACTION,
      address,
      privateKey,
      recipient,
      value,
      reason,
      addresses: [],
    } as const;

    //@ts-ignore
    const response = await getSocketInfo(SYSTEM_PORT, "localhost", action);

    res.status(201).json(parseMessage(response));
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};

export const getOwner = async (req: Request, res: Response) => {
  try {
    const action = {
      type: GET_OWNER,
    } as const;

    const response = await getSocketInfo(SYSTEM_PORT, "localhost", action);

    res.status(201).json(parseMessage(response));
  } catch (error) {
    res.status(500).json({
      error: "Error",
      message: error.message,
    });
  }
};
