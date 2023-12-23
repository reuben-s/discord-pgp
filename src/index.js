const { Toggle } = require('./Toggle.js');

export default class DiscordPgp {

    _selectChannelPatch(thisObject, channelInfo) {
        const channel = BdApi.findModuleByProps("getChannel").getChannel(channelInfo[0].channelId);

        if (channel == undefined) 
        {
            this.toggle.hide();
            return;
        }
        //const user = BdApi.findModuleByProps("getUser").getUser(channelInfo[0].recepient)
        else if (channel.type == 1 && !channel.isSystemDM() && !channel.rawRecipients[0].bot)
        {
            this.toggle.show()
            console.log('discord-pgp-> In DMs.');
        }
        else
        {
            this.toggle.hide();
        }
    }

    start() {
        console.clear();

        const MessageManager = BdApi.Webpack.getByKeys('sendMessage');
        const ChannelSelectorManager = BdApi.Webpack.getByKeys('selectChannel')

        BdApi.Patcher.before('discord-pgp', MessageManager, 'sendMessage', (thisObject, args) => {
            console.log(`discord-pgp-> Client sending new message: '${args[1].content}'`);
        });

        // Patch selectChannel function.
        this._selectChannelPatch = this._selectChannelPatch.bind(this);
        BdApi.Patcher.after('discord-pgp', ChannelSelectorManager, 'selectChannel', this._selectChannelPatch);

        this.toggle = new Toggle();

        console.log('discord-pgp-> Plugin successfully started.');
    } 

    stop() {
        BdApi.Patcher.unpatchAll('discord-pgp'); // Remove function patches
        this.toggle.remove(); // Delete modified DOM elements.
        console.log('discord-pgp-> Stopped plugin.');
    }
}