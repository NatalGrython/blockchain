import express from "express";
import {
  createTransaction,
  createUser,
  getAllChain,
  getBalance,
  getEvent,
  getOwner,
} from "../controllers";

const router = express.Router();

router.get("/balance", getBalance);

router.get("/chain", getAllChain);

router.get("/user", createUser);

router.post("/transaction", createTransaction);

router.get("/owner", getOwner);

router.post("/event", getEvent);

export default router;
