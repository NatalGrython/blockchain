import { createClient } from "redis";

export const getStatus = async () => {
  const client = createClient();
  await client.connect();
  const status = await client.get("status");
  await client.disconnect();
  return Boolean(status);
};

export const setStatus = async (status: boolean) => {
  const client = createClient();
  await client.connect();
  await client.set("status", String(status));
  await client.disconnect();
};

export const hasStatus = async () => {
  const client = createClient();
  await client.connect();
  try {
    const block = await client.get("status");
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
