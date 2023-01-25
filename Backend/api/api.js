var web3 = require("@solana/web3.js");
const bs58 = require("bs58");
const User = require("../model/User");

const addEarning = async (userId) => {
  try {
    const user = await User.findById(userId);

    console.log("---", user);

    user.earn = user.earn + 1;
    await user.save();

    console.log(user.earn);
  } catch (err) {
    console.error(err.message);
  }
};

const withDraw = async (wallet_address) => {
  var connection = new web3.Connection(web3.clusterApiUrl(process.env.NET));
  // Construct a `Keypair` from secret key
  var from = web3.Keypair.fromSecretKey(bs58.decode(process.env.DEPOSIT));
  // Generate a new random public key

  var to = new web3.PublicKey(wallet_address);
  // Add transfer instruction to transaction
  //   console.log(wallet_address);

  var transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports: web3.LAMPORTS_PER_SOL * process.env.PRICE * process.env.EARNING,
    })
  );
  // Sign transaction, broadcast, and confirm
  var signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );
  return signature;
};
module.exports = {
  addEarning,
  withDraw,
};
