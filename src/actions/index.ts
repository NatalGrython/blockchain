import {
  Block,
  BlockChain,
  createBlock,
  createUser as createUserBlockchain,
  deserializeBlock,
  loadUser,
  newTransaction,
  serializeBlock,
  serializeBlockJSON,
  serializeTransactionJSON,
  User,
  createConnectionDb,
  BlockChainEntity,
} from "blockchain-library";
import { getSocketInfo } from "../utils";

const GET_BALANCE = "GET_BALANCE";
const GET_FULL_CHAIN = "GET_FULL_CHAIN";
const CREATE_USER = "CREATE_USER";
const CREATE_TRANSACTION = "CREATE_TRANSACTION";
const PUSH_BLOCK = "PUSH_BLOCK";
const GET_BLOCK = "GET_BLOCK";
const GET_OWNER = "GET_OWNER";

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

type GetBlockAction = {
  type: typeof GET_BLOCK;
  index: number;
};

type GetOwnerAction = {
  type: typeof GET_OWNER;
};

type Action =
  | GetBalanceAction
  | GetFullChainAction
  | CreateUserAction
  | CreateTransactionAction
  | PushBlockAction
  | GetBlockAction
  | GetOwnerAction;

let controller = new AbortController();
let isMining = false;

const getBalance = async (address: string, chain: BlockChain) => {
  const balance = await chain.getBalance(address, await chain.size());
  return String(balance);
};

const getFullChain = async (chain: BlockChain) => {
  const { blocks } = await chain.getAllChain();
  const blocksJSon = blocks.map(serializeBlockJSON);
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
    if (String(port) === process.env.PORT) {
      continue;
    }
    const action = {
      type: PUSH_BLOCK,
      block: serializeBlockJSON(block),
      size,
      addressNode: {
        host: process.env.HOST || "localhost",
        port: process.env.PORT || 3000,
      },
    };
    console.log(action);
    await getSocketInfo(port, host, action);
  }
};

const createTransaction = async ({
  address,
  privateKey,
  recipient,
  value,
  chain,
  owner,
  addressesNode,
  signal,
}: {
  address: string;
  privateKey: string;
  recipient: string;
  value: number;
  chain: BlockChain;
  addressesNode: { port: number; host: string }[];
  signal: AbortSignal;
  owner: User;
}) => {
  const user = loadUser(address, privateKey);
  const transaction = newTransaction(
    user,
    await chain.lastHash(),
    recipient,
    value
  );

  if (!globalBlock) {
    globalBlock = createBlock(owner.stringAddress, await chain.lastHash());
  }

  if (globalBlock.transactions.length + 1 > 10) {
    return "fail";
  } else if (globalBlock.transactions.length + 1 === 10) {
    try {
      await globalBlock.addTransaction(chain, transaction);
      isMining = true;
      await globalBlock.accept(chain, user, signal);
      isMining = false;
      await chain.addNewBlock(globalBlock);
      await pushBlockToNet(addressesNode, globalBlock, await chain.size());
      globalBlock = createBlock(owner.stringAddress, await chain.lastHash());
    } catch (error) {
      //@ts-ignore
      return `fail${error.message}`;
    }
  } else {
    try {
      await globalBlock.addTransaction(chain, transaction);
    } catch (error) {
      //@ts-ignore
      return `fail${error.message}`;
    }
  }
  return JSON.stringify(serializeTransactionJSON(transaction));
};

const compareBlocks = async (
  addressNode: {
    port: number;
    host: string;
  },
  size: number,
  chain: BlockChain,
  owner: User
) => {
  const action = {
    type: GET_BLOCK,
    index: 0,
  } as const;

  const block = await getSocketInfo(addressNode.port, addressNode.host, action);

  const genesis = deserializeBlock(block);

  if (!(genesis.currentHash === genesis.hash())) {
    return;
  }

  const { getRepository, close } = await createConnectionDb(chain.fileName);
  const repository = getRepository(BlockChainEntity);

  await repository.clear();
  await close();

  await chain.addNewBlock(genesis);

  for (let i = 0; i < size; i++) {
    const action = {
      type: GET_BLOCK,
      index: i,
    } as const;
    const stringCurrentBlock = await getSocketInfo(
      addressNode.port,
      addressNode.host,
      action
    );
    const currentBlock = deserializeBlock(stringCurrentBlock);

    if (!(await currentBlock.isValid(chain))) {
      return;
    }

    chain.addNewBlock(currentBlock);
  }

  globalBlock = createBlock(owner.stringAddress, await chain.lastHash());

  if (isMining) {
    controller.abort();
    controller = new AbortController();
    isMining = false;
  }
};

const addBlock = async (
  block: string,
  chain: BlockChain,
  size: number,
  addressNode: { port: number; host: string },
  owner: User
) => {
  const currentBlock = deserializeBlock(block);
  console.log(addressNode);

  if (!(await currentBlock.isValid(chain))) {
    const currentSize = await chain.size();
    if (currentSize < size) {
      compareBlocks(addressNode, size, chain, owner);
      return "ok";
    }
    return "fail";
  }

  await chain.addNewBlock(currentBlock);
  globalBlock = createBlock(owner.stringAddress, await chain.lastHash());

  if (isMining) {
    controller.abort();
    controller = new AbortController();
    isMining = false;
  }

  return "ok";
};

const getBlock = async (chain: BlockChain, index: number) => {
  const { blocks } = await chain.getAllChain();
  return serializeBlock(blocks[index]);
};

const getOwner = (user: User) => {
  return JSON.stringify({
    address: user.stringAddress,
    privateKey: user.stringPrivate,
  });
};

export const reduceAction = (
  action: Action,
  chain: BlockChain,
  owner: User
) => {
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
        owner,
        signal: controller.signal,
      });
    case PUSH_BLOCK:
      return addBlock(
        action.block,
        chain,
        action.size,
        action.addressNode,
        owner
      );
    case GET_BLOCK:
      return getBlock(chain, action.index);
    case GET_OWNER:
      return getOwner(owner);
    default:
      return "Error";
  }
};

export const parseAction = (action: Buffer) =>
  JSON.parse(action.toString("utf-8")) as Action;
