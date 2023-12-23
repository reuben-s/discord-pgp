const openpgp = require('openpgp/lightweight');
const { PromptPassphrase } = require('./PromptPassphrase.js');
const { getCurrentDMUsername, checkIfGroupDM, checkIfBot } = require('./channelUtil.js');

export default class DiscordPgp {
    _refreshTooltip()
    {
        this.tooltip.hide();
        this.tooltip.show();
    }

    _toggleToggled()
    {
        this.toggled = !this.toggled;
        console.log('discord-pgp-> Toggled.')
        if (this.toggled)
        {
            this.tooltip.label = 'Disable PGP encryption';
            // Prompt for password if no PGP keys have been generated for the current direct message channel.
            BdApi.alert('Enter new PGP passphrase', BdApi.React.createElement(PromptPassphrase)); // Need to implement persistence.
            this._refreshTooltip();
        }
        else
        {
            this.tooltip.label = 'Enable PGP encryption';
            this._refreshTooltip();
        }
    }

    _renderEncryptionToggle()
    {
        this.toggled = false;
        this.toggle = document.createElement('div');
        this.toggle.className = 'bd-switch';
        this.toggle.innerHTML = '<input id=\'enableEncryption\' type=\'checkbox\'><div class=\'bd-switch-body\'><svg class=\'bd-switch-slider\' viewBox=\'0 0 28 20\' preserveAspectRatio=\'xMinYMid meet\'><rect class=\'bd-switch-handle\' fill=\'white\' x=\'4\' y=\'0\' height=\'20\' width=\'20\' rx=\'10\'></rect><svg class=\'bd-switch-symbol\' viewBox=\'0 0 20 20\' fill=\'none\'><path></path><path></path></svg></svg>';
        const userBanner = document.querySelector('.children__32014');
        this.tooltip = BdApi.UI.createTooltip(this.toggle, 'Enable PGP encryption', { side: 'bottom' });
        this.toggle.addEventListener('click', this._toggleToggled);
        userBanner.append(this.toggle);
    }

    _detectLocation() {
        if (document.getElementsByClassName('link__2e8e1').length > 0)
        {
            if (checkIfBot())
            {
                this.dmOpen = false;
                console.log('discord-pgp-> In Bot context.');
            }
            else if (checkIfGroupDM())
            {
                this.dmOpen = false;
                console.log('discord-pgp-> In group DM context.')
            }
            else
            {
                const user = getCurrentDMUsername();

                if (user != this.currentUsername) {
                    this.dmOpen = false;
                }

                if (!this.dmOpen)
                {
                    this.dmOpen = true;
                    this._renderEncryptionToggle();
                }
                this.currentUsername = user;
                console.log(`discord-pgp-> In user DM context: ${this.currentUsername}`);
            }
        }
        else
        {
            this.dmOpen = false;
            console.log('discord-pgp-> In server context');
        }
    }

    async _generateKeys(passphrase, username, userEmail)
    {
        return await openpgp.generateKey({
            type: 'ecc', // Type of the key, defaults to ECC
            curve: 'curve25519', // ECC curve name, defaults to curve25519
            userIDs: [{ name: username, email: userEmail }], // you can pass multiple user IDs
            passphrase: passphrase, // protects the private key
            format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
        });
    }

    start() {
        const targetNode = document.getElementById('app-mount');
        const config = { attributes: false, childList: true, subtree: true };

        const observe = (mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // Check if the user is in DMs or a server
                    this._detectLocation();
                }
            }
        };

        this.dmOpen = false;
        this.currentUsername = '';
        this.toggle = null;
        this.toggled = false;
        this.tooltip = null;

        this._toggleToggled = this._toggleToggled.bind(this);

        this.observer = new MutationObserver(observe);
        this.observer.observe(targetNode, config);

        const MessageManager = BdApi.Webpack.getByKeys('sendMessage');

        BdApi.Patcher.before('discord-pgp', MessageManager, 'sendMessage', (thisObject, args) => {
            console.log(`discord-pgp-> Client sending new message: '${args[1].content}'`);
        })

        const currentUser = BdApi.Webpack.getByKeys('getCurrentUser').getCurrentUser()

        console.clear();
        this._generateKeys('blah blah blah', currentUser.username, currentUser.email).then(({ privateKey, publicKey, revocationCertificate }) => {
            console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
            console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
            console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
        });
        console.log('discord-pgp-> Plugin successfully started.');
    } 

    stop() {
        this.observer.disconnect();
        if (this.toggle != null) {
            this.toggle.remove();
        }
        console.log('discord-pgp-> Stopped plugin.');
    }
}