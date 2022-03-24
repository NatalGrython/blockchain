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
  TXS_LIMIT,
} from "blockchain-library";
import { EventEmitter } from "events";
import { getSocketInfo } from "../utils";
import {
  PUSH_BLOCK,
  GET_BLOCK,
  GET_BALANCE,
  GET_FULL_CHAIN,
  CREATE_USER,
  CREATE_TRANSACTION,
  GET_OWNER,
} from "./constants";
import { Action } from "./types";
import { getGlobalBlock, hasGlobalBlock, setGlobalBlock } from "./utils";

let controller = new AbortController();
let isMining = false;

const getBalance = async (
  address: string,
  chain: BlockChain,
  emitter: EventEmitter
) => {
  const balance = await chain.getBalance(address, await chain.size(), emitter);
  return String(balance);
};

const getFullChain = async (chain: BlockChain, emitter: EventEmitter) => {
  const { blocks } = await chain.getAllChain(emitter);
  const blocksJSon = blocks.map(serializeBlockJSON);
  return JSON.stringify(blocksJSon);
};

const createUser = async (emitter: EventEmitter) => {
  const user = await createUserBlockchain(emitter);
  return JSON.stringify({
    address: user.stringAddress,
    privateKey: user.stringPrivate,
  });
};

const pushBlockToNet = async (
  addresses: { host: string; port: number }[],
  block: Block,
  size: number,
  emitter: EventEmitter
) => {
  const action = {
    type: PUSH_BLOCK,
    block: serializeBlockJSON(block),
    size,
    addressNode: {
      host: "localhost",
      port: Number(process.env.PORT),
    },
  } as const;
  emitter.emit("event", { type: "PUSH_BLOCK_NET", payload: { ...action } });
  const requsts = Promise.all(
    addresses
      .filter((item) => item.port !== Number(process.env.PORT))
      .map(({ host, port }) => getSocketInfo(port, host, action))
  );
  await requsts;
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
  emitter,
}: {
  address: string;
  privateKey: string;
  recipient: string;
  value: number;
  chain: BlockChain;
  addressesNode: { port: number; host: string }[];
  signal: AbortSignal;
  owner: User;
  emitter: EventEmitter;
}) => {
  const user = loadUser(address, privateKey);
  const transaction = newTransaction(
    user,
    await chain.lastHash(),
    recipient,
    value
  );

  if (!(await hasGlobalBlock())) {
    await setGlobalBlock(
      createBlock(owner.stringAddress, await chain.lastHash())
    );
  }

  const globalBlock = await getGlobalBlock();

  if (globalBlock.transactions.length + 1 > TXS_LIMIT) {
    emitter.emit("event", {
      type: "FAIL_TRANSACTION",
      payload: { message: "MAX TX IN BLOCK" },
    });
    return "fail";
  } else if (globalBlock.transactions.length + 1 === TXS_LIMIT) {
    try {
      await globalBlock.addTransaction(chain, transaction);
      isMining = true;
      emitter.emit("event", {
        type: "MINING",
        payload: true,
      });
      await globalBlock.accept(chain, owner, signal);
      isMining = false;
      emitter.emit("event", {
        type: "MINING",
        payload: false,
      });

      await chain.addNewBlock(globalBlock, emitter);
      await pushBlockToNet(
        addressesNode,
        globalBlock,
        await chain.size(),
        emitter
      );
      await setGlobalBlock(
        createBlock(owner.stringAddress, await chain.lastHash())
      );
    } catch (error) {
      //@ts-ignore
      await setGlobalBlock(
        createBlock(owner.stringAddress, await chain.lastHash())
      );
      emitter.emit("event", {
        type: "FAIL_TRANSACTION",
        payload: { message: error.message },
      });
      return `fail ${error.message}`;
    }
  } else {
    try {
      await globalBlock.addTransaction(chain, transaction);
      await setGlobalBlock(globalBlock);
      emitter.emit("event", {
        type: "ADD_TRANSACTION",
        payload: { block: globalBlock },
      });
    } catch (error) {
      //@ts-ignore
      emitter.emit("event", {
        type: "FAIL_TRANSACTION",
        payload: { message: error.message },
      });
      return `fail ${error.message}`;
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

  const connection = await createConnectionDb(chain.fileName);
  const repository = connection.getRepository(BlockChainEntity);

  await repository.clear();
  await connection.close();

  await chain.addNewBlock(genesis);

  for (let i = 1; i < size; i++) {
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

    //@ts-ignore
    if (!(await currentBlock.isValid(chain, i, "compare"))) {
      return;
    }

    await chain.addNewBlock(currentBlock);
  }

  await setGlobalBlock(
    createBlock(owner.stringAddress, await chain.lastHash())
  );

  if (isMining) {
    controller.abort();
    controller = new AbortController();
    isMining = false;
  }
};

const addBlock = async (
  block: ReturnType<typeof serializeBlockJSON>,
  chain: BlockChain,
  size: number,
  addressNode: { port: number; host: string },
  owner: User,
  emitter: EventEmitter
) => {
  const currentBlock = deserializeBlock(block);
  emitter.emit("event", {
    type: "PUSHED_BLOCK",
    payload: { block, addressNode },
  });
  //@ts-ignore
  if (!(await currentBlock.isValid(chain, await chain.size(), "addedd"))) {
    const currentSize = await chain.size();
    if (currentSize < size) {
      await compareBlocks(addressNode, size, chain, owner);
      emitter.emit("event", { type: "BLOCK_CHAIN_CHANGED" });
      return "ok";
    }
    emitter.emit("event", { type: "BLOCK_CHAIN_NOT_CHANGED" });
    return "fail";
  }

  await chain.addNewBlock(currentBlock, emitter);

  await setGlobalBlock(
    createBlock(owner.stringAddress, await chain.lastHash())
  );

  if (isMining) {
    controller.abort();
    controller = new AbortController();
    isMining = false;
  }

  return "ok";
};

const getBlock = async (
  chain: BlockChain,
  index: number,
  emitter: EventEmitter
) => {
  const { blocks } = await chain.getAllChain();
  emitter.emit("event", {
    type: "GET_BLOCK",
    payload: { block: serializeBlock(blocks[index]) },
  });
  return serializeBlock(blocks[index]);
};

const getOwner = (user: User, emitter: EventEmitter) => {
  const ownerString = JSON.stringify({
    address: user.stringAddress,
    privateKey: user.stringPrivate,
  });

  emitter.emit("event", {
    type: "GET_OWNER",
    payload: { owner: ownerString },
  });
  return ownerString;
};

export const reduceAction = (
  action: Action,
  chain: BlockChain,
  owner: User,
  emitter: EventEmitter
) => {
  switch (action.type) {
    case GET_BALANCE:
      return getBalance(action.address, chain, emitter);
    case GET_FULL_CHAIN:
      return getFullChain(chain, emitter);
    case CREATE_USER:
      return createUser(emitter);
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
        emitter,
      });
    case PUSH_BLOCK:
      return addBlock(
        action.block,
        chain,
        action.size,
        action.addressNode,
        owner,
        emitter
      );
    case GET_BLOCK:
      return getBlock(chain, action.index, emitter);
    case GET_OWNER:
      return getOwner(owner, emitter);
    default:
      return "Error";
  }
};

export const parseAction = (action: Buffer) =>
  JSON.parse(action.toString("utf-8")) as Action;
