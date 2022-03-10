import { Block, createBlock } from "./block";
import { loadChain, newChain } from "./chain";
import { newTransaction } from "./transactions";
import { createUser, loadUser } from "./user";

(async () => {
  try {
    const user = await createUser();

    const user1 = loadUser(user.stringAddress, user.stringPrivate);
    console.log(user1);

    // console.log(user.stringAddress === user1.stringAddress);

    // await newChain("kek.sqlite", user.stringAddress);

    // const { blockchain: chain, close } = await loadChain("kek.sqlite");

    // for (let i = 0; i < 4; i++) {
    //   const block = new Block(user.stringAddress, await chain.lastHash());

    //   await block.addTransaction(
    //     chain,
    //     newTransaction(user, await chain.lastHash(), "adress1", 5)
    //   );

    //   await block.addTransaction(
    //     chain,
    //     newTransaction(user, await chain.lastHash(), "adress2", 3)
    //   );
    //   await block.accept(chain, user);
    //   await chain.addNewBlock(block);
    // }

    // await close();
  } catch (error) {
    console.error(error);
  }
})();
