const { PgpManager } = require('./PgpManager.js');
export class Toggle
{
    constructor()
    {
        this.pgpManager = new PgpManager('discord-pgp.json');

        this._toggleToggled = this._toggleToggled.bind(this);
        this.toggled = false;
        this.currentState = "show";
        this._generateToggle();
    }

    _generateToggle()
    {
        if (this.currentState == "stopped") {
            this.toggle.remove();
            return;
        };

        this.toggle = document.createElement('div');
        this.toggle.className = 'bd-switch';
        this.toggle.innerHTML = '<input id=\'enableEncryption\' type=\'checkbox\'><div class=\'bd-switch-body\'><svg class=\'bd-switch-slider\' viewBox=\'0 0 28 20\' preserveAspectRatio=\'xMinYMid meet\'><rect class=\'bd-switch-handle\' fill=\'white\' x=\'4\' y=\'0\' height=\'20\' width=\'20\' rx=\'10\'></rect><svg class=\'bd-switch-symbol\' viewBox=\'0 0 20 20\' fill=\'none\'><path></path><path></path></svg></svg>';
        const userBanner = document.querySelector('.children__32014');
        this.tooltip = BdApi.UI.createTooltip(this.toggle, 'Enable PGP encryption', { side: 'bottom' });
        this.toggle.addEventListener('click', this._toggleToggled);

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
            // Hand over control to pgpManager if encryption is enabled.
            this.pgpManager.getKeyPair(this.currentUsername);
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