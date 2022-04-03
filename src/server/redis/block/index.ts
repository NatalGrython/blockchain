import { Block, deserializeBlock, serializeBlock } from "blockchain-library";
import { createClient } from "redis";

export const getGlobalBlock = async () => {
  const client = createClient();

  await client.connect();

  const blockString = await client.get("block");

  await client.disconnect();

  return deserializeBlock(blockString);
};

export const setGlobalBlock = async (block: Block) => {
  const blockString = serializeBlock(block);

  const client = createClient();

  await client.connect();

  await client.set("block", blockString);

  await client.disconnect();
};

export const hasGlobalBlock = async () => {
  const client = createClient();

  await client.connect();

  try {
    const block = await client.get("block");

    if (block) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  } finally {
    await client.disconnect();
  }
};
