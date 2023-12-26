const { PgpUtil } = require('./PgpUtil.js');
const { DbManager } = require('./DbManager.js');
const { showPassphrasePrompt } = require('./PromptPassphrase.js');
const { showAbortedMessage } = require('./AbortedMessage.js');

// This code is really bad, will re-write at some point.

export class Toggle
{
    constructor()
    {
        this.getChannel = BdApi.findModuleByProps("getChannel").getChannel

        this._dbManager = new DbManager('discord-pgp.json');
        this._currentUser = BdApi.Webpack.getByKeys('getCurrentUser').getCurrentUser();

        this._toggleToggled = this._toggleToggled.bind(this);
        this.currentState = 'show';
        
        this._MessageManager = BdApi.Webpack.getByKeys('sendMessage');

        this._sendMessagePatch = this._sendMessagePatch.bind(this);
        BdApi.Patcher.before('discord-pgp', this._MessageManager, 'sendMessage', this._sendMessagePatch);

        this._messageCreateInterceptor();

        this._currentChannel = {};
        this._generateToggle();
    }

    _messageCreateHandler(event)
    {
        if (event[0].message.author.id == this._currentUser.id) return; // If client sends message, it is handled by patching sendMessage rather than MESSAGE_CREATE dispatch.

        // We need to monitor DMs for potential key exchanges, so this is done here.
        if (this.getChannel(event[0].message.channel_id).type == 1)
        {
            try
            {
                const json = JSON.parse(event[0].message.content.substring(3, event[0].message.content.length - 3)); // Remove backticks from message and convert to json object
                if (json['reqPublicKey']) // User is requesting our public key.
                {
                    BdApi.UI.showToast(`${event[0].message.author.username} wants to send you an encrypted message.`, { timeout: 5000 }); // Notify user if someone is trying to send them an encrypted message.
                                                                                                                                          // Decided not to automate this as people could spam our client and get us rate limited easily.
                }
            }
            catch (e) { /* Couldn't parse JSON so just ignore error*/ }
        }

        // Otherwise, return out of attempting to encrypt anything by checking the following conditions.
        if (event[0].message.channel_id != this._currentChannel.id || !this.toggled) return; // Return if message is not from current channel
                                                                                             // or return if messages are not currently being encrypted
        
        try
        {
            const json = JSON.parse(event[0].message.content.substring(3, event[0].message.content.length - 3)); // Remove backticks from message and convert to json object
            if (json['reqPublicKey']) // User is requesting our public key. Send it and check that we have theirs. If we don't have it, send a reqPublicKey request back to them.
            {
                this._dbManager.getChannel(this._currentChannel.id, (channel) => {
                    this.sendMessage(`\`\`\`${JSON.stringify({ publicKey: channel['client']['public-key'], reqPublicKey: true ? channel['public-key'] == null : false })}\`\`\``);
                });
            }
            else if (json['publicKey'])
            {
                setUserPublicKey(this._currentChannel.id, json['publicKey']);
                console.log(`discord-pgp-> Set user public-key in channel '${self._currentChannel.id}'`);
            }
        }
        catch
        {
            console.log('discord-pgp-> Failed to decrypt message in channel where encryption is enabled.');
        }

        event[0].message.content = `MODIFIED - ${event[0].message.content}`;
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
            // Attempt to encrypt message with user's public key. Request public key if public key is not availiable.
            this._dbManager.getChannel(this._currentChannel.id, (channel) => {
                const publicKey = channel['public-key'];
                if (publicKey == null) // User's public key is not yet available so request key and abort message plaintext send.
                {
                    args[1].content = `\`\`\`${JSON.stringify({ reqPublicKey: true })}\`\`\``;
                    showAbortedMessage();
                    console.log(thisObject);
                }
                else
                {
                    // Messages encrypted here.
                    args[1].content = `MODIFIED ${args[1].content}`;
                }
            });
        }
    }

    _toggleToggled()
    {
        this.toggled = !this.toggled;

        console.log('discord-pgp-> Toggled.')
        if (this.toggled)
        {
            this.tooltip.label = 'Disable PGP encryption';
            this._dbManager.getChannel(this._currentChannel.id, (channelJson) => {
                // Generate new keys if none exist
                if (channelJson["client"]["public-key"] == null && channelJson["client"]["private-key"] == null)
                {
                    // Prompt user for new passphrase
                    showPassphrasePrompt().then((passphrase) => {
                        // Generate key pair with passphrase
                        PgpUtil.generateKeyPair(this._currentUser.username, this._currentUser.email, passphrase).then(({ privateKey, publicKey, revocationCertificate }) => {
                            this._dbManager.setClientKeyPair(this._currentChannel.id, publicKey, privateKey);
                            this.sendMessage(`\`\`\`${JSON.stringify({ publicKey: publicKey, reqPublicKey: true ? channelJson['public-key'] == null : false })}\`\`\``)
                            console.log('discord-pgp-> Generated new key pair.');
                        })
                    });
                }
                else // key pair already exists so send it to user
                {
                    this.sendMessage(`\`\`\`${JSON.stringify({ publicKey: channelJson['client']['public-key'], reqPublicKey: true ? channelJson['public-key'] == null : false })}\`\`\``);
                }

            });

            this._refreshTooltip();
        }
        else
        {
            this.tooltip.label = 'Enable PGP encryption';
            this._refreshTooltip();
        }
    }
    
    _generateToggle()
    {
        if (this.currentState == 'stopped') {
            this.toggle.remove();
            return;
        };
        this.toggle = document.createElement('div');
        this.toggle.className = 'bd-switch';
        this.toggle.innerHTML = `
        <input id='discord-pgp-toggle-encryption-on-off' type='checkbox'/>
        <div class='bd-switch-body'>
            <svg class='bd-switch-slider' viewBox='0 0 28 20' preserveAspectRatio='xMinYMid meet'>
            <rect class='bd-switch-handle' fill='white' x='4' y='0' height='20' width='20' rx='10'></rect>
                <svg class='bd-switch-symbol' viewBox='0 0 20 20' fill='none'>
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

        if (this.currentState == 'show')
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

    sendMessage(content)
    {
        this._MessageManager.sendMessage(this._currentChannel.id, 
            { 
                content: content, 
                invalidEmojis: [], 
                tts: false, 
                validNonShortcutEmojis: [], 
                automated: true 
        });
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
        this.currentState = 'show';
        this.toggle.style.display = 'block';
    }

    hide()
    {
        this.currentState = 'hide';
        this.toggle.style.display = 'none';
    }

    _messageCreateInterceptor()
    {
        window.webpackChunkdiscord_app.push([
        [ Symbol() ],
        {},
        r => {
            if (!r.b) return;
            const FluxDispatcherModule = Object.values(r.c).find(m=>Array.isArray(m.exports?.default?._interceptors));
            FluxDispatcherModule?.exports?.default?.addInterceptor((event) => {
            if (event.type === 'MESSAGE_CREATE') {
                this._messageCreateHandler([event]);
            };
            });
        }
        ]);
    }

    // This needs to be fixed ...
    _deleteMessageCreateInterceptor()
    {
        window.webpackChunkdiscord_app.push([
          [ Symbol() ],
          {},
          r => {
            if (!r.b) return;
            const FluxDispatcherModule = Object.values(r.c).find(m=>Array.isArray(m.exports?.default?._interceptors));
            FluxDispatcherModule?.exports?.default?._interceptors?.splice(2, 1);
            console.log('discord-pgp-> Removed dispatch inspector')
          }
        ]);
    }

    remove()
    {   
        this._deleteMessageCreateInterceptor();
        this.toggle.remove();
        this.currentState = 'stopped';
    }
}