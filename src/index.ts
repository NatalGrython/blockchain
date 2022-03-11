import {
  createBlock,
  createUser,
  loadChain,
  newChain,
  newTransaction,
} from "./blockchain";

(async () => {
  const user = await createUser();
  await newChain("block.sqlite", user.stringAddress);

  const { blockchain, close } = await loadChain("block.sqlite");

  const block = createBlock(user.stringAddress, await blockchain.lastHash());
  const tx = newTransaction(user, await blockchain.lastHash(), "kek", 20);

  await block.addTransaction(blockchain, tx);

  await block.accept(blockchain, user);

  await blockchain.addNewBlock(block);

  await close();
})();
