import {
  Block,
  BlockChain,
  createBlock,
  createUser as createUserBlockchain,
  deserializeBlock,
  loadUser,
  newTransaction,
  serializeBlockJSON,
  serializeTransactionJSON,
} from "blockchain-library";
import { getSocketInfo } from "../utils";

const GET_BALANCE = "GET_BALANCE";
const GET_FULL_CHAIN = "GET_FULL_CHAIN";
const CREATE_USER = "CREATE_USER";
const CREATE_TRANSACTION = "CREATE_TRANSACTION";
const PUSH_BLOCK = "PUSH_BLOCK";

let globalBlock: Block;

type GetBalanceAction = {
  type: typeof GET_BALANCE;
  address: string;
};

type GetFullChainAction = {
  type: typeof GET_FULL_CHAIN;
};

type CreateUserAction = {
  type: typeof CREATE_USER;
};

type PushBlockAction = {
  type: typeof PUSH_BLOCK;
  block: string;
  size: number;
  addressNode: {
    port: number;
    host: string;
  };
};

type CreateTransactionAction = {
  type: typeof CREATE_TRANSACTION;
  address: string;
  privateKey: string;
  recipient: string;
  value: number;
  addresses: {
    port: number;
    host: string;
  }[];
};

type Action =
  | GetBalanceAction
  | GetFullChainAction
  | CreateUserAction
  | CreateTransactionAction
  | PushBlockAction;

const getBalance = async (address: string, chain: BlockChain) => {
  const balance = await chain.getBalance(address, await chain.size());
  globalBlock = createBlock("Universy", await chain.lastHash());
  return String(balance);
};

const getFullChain = async (chain: BlockChain) => {
  const { blocks } = await chain.getAllChain();
  const blocksJSon = blocks.map(serializeBlockJSON);
  globalBlock = createBlock("Universy", await chain.lastHash());
  return JSON.stringify(blocksJSon);
};

const createUser = async () => {
  const user = await createUserBlockchain();
  return JSON.stringify({
    address: user.stringAddress,
    privateKey: user.stringPrivate,
  });
};

const pushBlockToNet = async (
  addresses: { host: string; port: number }[],
  block: Block,
  size: number
) => {
  for (const { host, port } of addresses) {
    const action = {
      type: PUSH_BLOCK,
      block: serializeBlockJSON(block),
      size,
      addressNode: {
        host: "localhost",
        port: process.env.PORT,
      },
    };
    await getSocketInfo(port, host, action);
  }
};

const createTransaction = async ({
  address,
  privateKey,
  recipient,
  value,
  chain,
  block,
  addressesNode,
}: {
  address: string;
  privateKey: string;
  recipient: string;
  value: number;
  chain: BlockChain;
  block: Block;
  addressesNode: { port: number; host: string }[];
}) => {
  const user = loadUser(address, privateKey);
  const transaction = newTransaction(
    user,
    await chain.lastHash(),
    recipient,
    value
  );
  if (block.transactions.length + 1 > 10) {
    return "fail";
  } else if (block.transactions.length + 1 === 10) {
    await block.addTransaction(chain, transaction);
    await block.accept(chain, user);
    await chain.addNewBlock(block);
    await pushBlockToNet(addressesNode, block, await chain.size());
  } else {
    await block.addTransaction(chain, transaction);
    return JSON.stringify(serializeTransactionJSON(transaction));
  }
};

const compareBlocks = async (
  addressNode: {
    port: number;
    host: string;
  },
  size: number
) => {};

const addBlock = async (
  block: string,
  chain: BlockChain,
  size: number,
  addressNode: { port: number; host: string }
) => {
  const currentBlock = deserializeBlock(block);

  if (!(await currentBlock.isValid(chain))) {
    const currentSize = await chain.size();
    if (currentSize < size) {
      compareBlocks(addressNode, size);
      return "ok";
    }
    return "fail";
  }

  await chain.addNewBlock(currentBlock);
  globalBlock = createBlock("Universy", await chain.lastHash());

  return "ok";
};

export const reduceAction = (action: Action, chain: BlockChain) => {
  switch (action.type) {
    case GET_BALANCE:
      return getBalance(action.address, chain);
    case GET_FULL_CHAIN:
      return getFullChain(chain);
    case CREATE_USER:
      return createUser();
    case CREATE_TRANSACTION:
      return createTransaction({
        address: action.address,
        addressesNode: action.addresses,
        privateKey: action.privateKey,
        recipient: action.recipient,
        value: action.value,
        chain,
        block: globalBlock,
      });
    case PUSH_BLOCK:
      return addBlock(action.block, chain, action.size, action.addressNode);
    default:
      return "Error";
  }
};

export const parseAction = (action: Buffer) =>
  JSON.parse(action.toString("utf-8")) as Action;
