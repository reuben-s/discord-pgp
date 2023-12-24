# discord-pgp
A BetterDiscord plugin which encrypts direct messages using the OpenPGP standard.
## Building
Clone the repository
```
git clone https://github.com/reuben-s/discord-pgp
```
Install necessary packages
```
npm install
```
Build the project using webpack
```
npm run build
```
The plugin can be found in the `dist` folder within the project files upon completion of the build. Copy the `discord-pgp.plugin.js` file into the BetterDiscord plugins directory. The plugin will will work out of the box.

## Dependencies
- [Webpack](https://github.com/webpack/webpack)
- [OpenPGP.js](https://github.com/openpgpjs/openpgpjs)


## The future
Right now, data persistence is achieved by reading and writing to a JSON file. This is unencrypted (exposing private keys) and uses an uneccessary amount of resources due to the amount of read/writes taken to store data. In the future I would like to encrypt this storage and add some sort of cache to the plugin to reduce the amount of file read/writes.
