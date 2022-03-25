import {
  BlockChain,
  User,
  loadUser,
  newTransaction,
  createBlock,
  TXS_LIMIT,
  serializeTransactionJSON,
  BlockChainEntity,
  createConnectionDb,
  deserializeBlock,
  serializeBlockJSON,
} from "blockchain-library";
import { EventEmitter } from "events";
import {
  getGlobalBlock,
  hasGlobalBlock,
  setGlobalBlock,
} from "../../redis/block";
import { getStatus, setStatus } from "../../redis/status";
import { getSocketInfo } from "../../utils";
import { GET_BLOCK } from "../constants";
import { pushBlockToNet } from "./utils";

let controller = new AbortController();

export const createTransaction = async ({
  address,
  privateKey,
  recipient,
  value,
  chain,
  owner,
  addressesNode,
  emitter,
}: {
  address: string;
  privateKey: string;
  recipient: string;
  value: number;
  chain: BlockChain;
  addressesNode: { port: number; host: string }[];
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
      await setStatus(true);
      emitter.emit("event", {
        type: "MINING",
        payload: true,
      });
      await globalBlock.accept(chain, owner, controller.signal);
      await setStatus(true);
      emitter.emit("event", {
        type: "MINING",
        payload: false,
      });

      await chain.addNewBlock(globalBlock);
      emitter.emit("event", {
        type: "ADD_NEW_BLOCK",
        payload: { block: globalBlock },
      });
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

export const addBlock = async (
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

  await chain.addNewBlock(currentBlock);
  emitter.emit("event", {
    type: "ADD_NEW_BLOCK",
    payload: { block: currentBlock },
  });

  await setGlobalBlock(
    createBlock(owner.stringAddress, await chain.lastHash())
  );

  if (await getStatus()) {
    controller.abort();
    controller = new AbortController();
    setStatus(false);
  }

  return "ok";
};

export const compareBlocks = async (
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

  if (await getStatus()) {
    controller.abort();
    controller = new AbortController();
    setStatus(false);
  }
};
