const fs = require("fs");
const path = require("path");
// Discord util
const { showPassphrasePrompt } = require('./PromptPassphrase.js');
// OpenPGP imports
const { generateKey } = require('openpgp/lightweight');

export class PgpManager
{
    constructor(filePath)
    {
        this._path = path.join(__dirname, filePath);
        this._cache = [];

        this._initialiseDb();
    }

    _initialiseDb()
    {
        // Create new database file if one does not exist.
        if (!fs.existsSync(this._path))
        {
            fs.writeFile(this._path, JSON.stringify({ }), (err) => {
                if (err) throw err;
                console.log('discord-pgp-> Create database file.');
            });
        }    
    }

    async _generateKeys(username, email, passphrase)
    {
        const options = {
            userIds: [{ name: username, email: email }], // user information
            curve: 'ed25519', // you can use other curves as well
            passphrase: passphrase, // optional passphrase
        };
        
        // Generate key pair
        //const { privateKeyArmored, publicKeyArmored, key } = await generateKey(options);
        return generateKey(options);
    }

    getKeyPair(username)
    {
        // Read the content of the JSON file
        fs.readFile(this._path, 'utf8', (err, data) => {
            if (err) 
            {
                console.error(`Error reading file: ${this._path}`, err);
                return;
            }
        
            try 
            {
                // Parse the JSON data
                const json = JSON.parse(data);
                
                // Chat is yet to be encrypted, prompt user for new passphrase and create new key pair.
                if (!json.hasOwnProperty(username))
                {
                    showPassphrasePrompt().then((passphrase) => { console.log(passphrase) });
                }
                // Otherwise begin encrypting messages.
                else
                {
                    // Temp.
                }

            } 
            catch (parseError) 
            {
                console.error('Error parsing JSON:', parseError);
            }
        });
    }
}