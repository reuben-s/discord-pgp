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
The plugin will now be found in the `dist` folder within the project files. Copy the `discord-pgp.plugin.js` file into the BetterDiscord plugins directory.

## Dependencies
- [Webpack](https://github.com/webpack/webpack)
- [OpenPGP.js](https://github.com/openpgpjs/openpgpjs)
