const { PgpUtil } = require('./PgpUtil.js');
const { DbManager } = require('./DbManager.js');
const { showPassphrasePrompt } = require("./PromptPassphrase.js");

// This code is really bad, will re-write at some point.

export class Toggle
{
    constructor()
    {
        this._dbManager = new DbManager('discord-pgp.json');
        this._currentUser = BdApi.Webpack.getByKeys('getCurrentUser').getCurrentUser();

        this._toggleToggled = this._toggleToggled.bind(this);
        this.currentState = "show";
        
        this._MessageManager = BdApi.Webpack.getByKeys('sendMessage');
        this._Dispatcher = BdApi.Webpack.getModule(m => m.dispatch && m.subscribe);

        this._sendMessagePatch = this._sendMessagePatch.bind(this);
        BdApi.Patcher.before('discord-pgp', this._MessageManager, 'sendMessage', this._sendMessagePatch);

        this._dispatchPatch = this._dispatchPatch.bind(this);
        BdApi.Patcher.before('discord-pgp', this._Dispatcher, 'dispatch', this._dispatchPatch);

        this._currentChannel = {};
        this._generateToggle();
    }

    __dispatchPatch(thisObject, args)
    {
        if (args[0].type != "MESSAGE_CREATE");

        args[0].message.content = `MODIFIED - ${args[0].message.content}`;
    }

    _sendMessagePatch(thisObject, args)
    {
        if (!this.toggled) return;

        if (args[1].hasOwnProperty('automated'))
        {
            delete args[1]['automated'];
        }
        else
        {
            // Messages encrypted here.
            args[1].content = `MODIFIED ${args[1].content}`;
        }

        console.log(`discord-pgp-> Client sending new message: '${args[1].content}'`);
    }

    _generateToggle()
    {
        if (this.currentState == "stopped") {
            this.toggle.remove();
            return;
        };
        this.toggle = document.createElement("div");
        this.toggle.className = 'bd-switch';
        this.toggle.innerHTML = `
        <input id="discord-pgp-toggle-encryption-on-off" type="checkbox"/>
        <div class="bd-switch-body">
            <svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet">
            <rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect>
                <svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none">
                    <path></path>
                    <path></path>
                </svg>
            </svg>
        </div>
        `;
        const userBanner = document.querySelector('.children__32014');
        this.tooltip = BdApi.UI.createTooltip(this.toggle, 'Enable PGP encryption', { side: 'bottom' });
        this.toggle.addEventListener('change', this._toggleToggled);
        this.toggled = false;

        if (this.toggle == null) this._generateToggle();

        userBanner.append(this.toggle);

        if (this.currentState == "show")
        {
            this.show()
        }
        else
        {
            this.hide();
        }

        BdApi.DOM.onRemoved(this.toggle, () => {
            userBanner.append(this.toggle);
            this._generateToggle();
        });
    }

    _toggleToggled()
    {
        this.toggled = !this.toggled;

        console.log('discord-pgp-> Toggled.')
        if (this.toggled)
        {
            this.tooltip.label = 'Disable PGP encryption';
            this._dbManager.getChannel(this._currentChannel.id, (channelJson) => {
                if (channelJson["client"]["public-key"] == null && channelJson["client"]["private-key"] == null)
                {
                    // Prompt user for new passphrase
                    showPassphrasePrompt().then((passphrase) => {
                        // Generate key pair with passphrase
                        PgpUtil.generateKeyPair(this._currentUser.username, this._currentUser.email, passphrase).then(({ privateKey, publicKey, revocationCertificate }) => {
                            this._dbManager.setClientKeyPair(this._currentChannel.id, publicKey, privateKey);
                            console.log('discord-pgp-> Generated new key pair.');
                            this._MessageManager.sendMessage(this._currentChannel.id, { content: `\`\`\`${publicKey}\`\`\`Don't understand this message? You're probably not using [discord-pgp](https://github.com/reuben-s/discord-pgp).`, invalidEmojis: [], tts: false, validNonShortcutEmojis: [], automated: true });
                            console.log('discord-pgp-> Shared new public key.');
                        });
                    });
                }
                // Now handle encryption.
            });

            //this.pgpManager.getKeyPair(this._currentChannel.rawRecipients[0].username);

            this._refreshTooltip();
        }
        else
        {
            this.tooltip.label = 'Enable PGP encryption';
            this._refreshTooltip();
        }
    }
    
    _refreshTooltip()
    {
        this.tooltip.hide();
        this.tooltip.show();
    }

    setCurrentChannel(channel)
    {
        this._currentChannel = channel;
    }

    show()
    {
        this.currentState = "show";
        this.toggle.style.display = "block";
    }

    hide()
    {
        this.currentState = "hide";
        this.toggle.style.display = "none";
    }

    remove()
    {   
        this.toggle.remove();
        this.currentState = "stopped";
    }
}