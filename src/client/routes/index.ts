import express from "express";
import { createUser, getAllChain, getBalance } from "../controllers";

const router = express.Router();

router.get("/balance", getBalance);

router.get("/chain", getAllChain);

router.get("/user", createUser);

router.post("/transaction");

export default router;
