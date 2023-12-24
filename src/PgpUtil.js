const { generateKey } = require("openpgp/lightweight");

export class PgpUtil 
{
  static async generateKeyPair(username, email, passphrase,) 
  {
    const options = {
      userIDs: [{ name: username, email: email }], // user information
      curve: "ed25519", // you can use other curves as well
      passphrase: passphrase, // optional passphrase
    };

    // Generate key pair
    //const { privateKeyArmored, publicKeyArmored, key } = await generateKey(options);
    return generateKey(options);
  }
}
