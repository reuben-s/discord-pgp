const { Toggle } = require('./Toggle.js');

export default class DiscordPgp {

    _selectChannelPatch(thisObject, channelInfo) {
        const channel = this.getChannel(channelInfo[0].channelId);

        if (channel == undefined) 
        {
            this.toggle.hide();
            return;
        }
        else if (channel.type == 1 && !channel.isSystemDM() && !channel.rawRecipients[0].bot)
        {
            this.toggle.setCurrentChannel(channel);
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
        
        const ChannelSelectorManager = BdApi.Webpack.getByKeys('selectChannel');
        
        this.getChannel = BdApi.findModuleByProps("getChannel").getChannel;

        this.toggle = new Toggle();
        this._selectChannelPatch(null, [{ channelId: BdApi.Webpack.getByKeys('getChannelId').getChannelId() }]) // Check if we are currently in DMs when plugin starts.

        // Patch selectChannel function.
        this._selectChannelPatch = this._selectChannelPatch.bind(this);
        BdApi.Patcher.after('discord-pgp', ChannelSelectorManager, 'selectChannel', this._selectChannelPatch);

        console.log('discord-pgp-> Plugin successfully started.');
    } 

    stop() {
        BdApi.Patcher.unpatchAll('discord-pgp'); // Remove function patches
        this.toggle.remove(); // Delete modified DOM elements.
        console.log('discord-pgp-> Stopped plugin.');
    }
}