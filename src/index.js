/**
 * @name discord-pgp
 * @author reuben-s
 * @description A BetterDiscord plugin which encrypts direct messages using OpenPGP.
 * @version 0.0.1
 */

const openpgp = require('openpgp/lightweight');

export default class DiscordPgp {
    _refreshTooltip()
    {
        this.tooltip.hide();
        this.tooltip.show();
    }

    _toggleToggled()
    {
        this.toggled = !this.toggled;
        console.log("discord-pgp-> Toggled.")
        if (this.toggled)
        {
            this.tooltip.label = "Disable PGP encryption";
            console.log(`discord-pgp-> ${this.tooltip.content}`);
            this._refreshTooltip();
        }
        else
        {
            this.tooltip.label = "Enable PGP encryption";
            this._refreshTooltip();
        }
    }

    _renderEncryptionToggle()
    {
        this.toggled = false;
        this.toggle = document.createElement("div");
        this.toggle.className = "bd-switch";
        this.toggle.innerHTML = '<input id="enableEncryption" type="checkbox"><div class="bd-switch-body"><svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet"><rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none"><path></path><path></path></svg></svg>';
        const userBanner = document.querySelector(".children__32014");
        this.tooltip = BdApi.UI.createTooltip(this.toggle, "Enable PGP encryption", { side: "bottom" });
        this.toggle.addEventListener("click", this._toggleToggled);
        userBanner.append(this.toggle);
    }

    _getCurrentDMUsername()
    {
        const usernameTitle = document.querySelector('.titleWrapper__482dc > h1 > [aria-label]');
        return usernameTitle.getAttribute('aria-label');
    }

    _checkIfGroupDM()
    {
        const groupDM = document.querySelector('.hiddenVisually__06c3e');
        return groupDM.innerHTML == "Group DM";
    }

    _checkIfBot()
    {
        const botTag = document.querySelector('[aria-label="Verified Bot"]');
        const systemTag = document.querySelector('.defaultColor__77578 > div[aria-label="discord"]');
        return (botTag != null) || (systemTag != null)
    }

    _detectLocation() {
        if (document.getElementsByClassName("link__2e8e1").length > 0)
        {
            if (this._checkIfBot())
            {
                this.dmOpen = false;
                console.log("discord-pgp-> In Bot context.");
            }
            else if (this._checkIfGroupDM())
            {
                this.dmOpen = false;
                console.log("discord-pgp-> In group DM context.")
            }
            else
            {
                const user = this._getCurrentDMUsername();

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
            console.log("discord-pgp-> In server context");
        }
    }

    async _generateKeys()
    {
        return await openpgp.generateKey({
            type: 'ecc', // Type of the key, defaults to ECC
            curve: 'curve25519', // ECC curve name, defaults to curve25519
            userIDs: [{ name: 'baz', email: 'jon@example.com' }], // you can pass multiple user IDs
            passphrase: 'super long and hard to guess secret', // protects the private key
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
        this.currentUsername = "";
        this.toggle = null;
        this.toggled = false;
        this.tooltip = null;

        this._toggleToggled = this._toggleToggled.bind(this);

        this.observer = new MutationObserver(observe);
        this.observer.observe(targetNode, config);

        this._generateKeys().then(({ privateKey, publicKey, revocationCertificate }) => {
            console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
            console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
            console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
        });

        console.log("discord-pgp-> Plugin successfully started.");
    } 

    stop() {
        this.observer.disconnect();
        if (this.toggle != null) {
            this.toggle.remove();
        }
        console.log("discord-pgp-> Stopped plugin.");
    }
}