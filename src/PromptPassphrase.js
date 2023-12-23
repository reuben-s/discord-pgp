const EventEmitter = require('events');

class PromptPassphrase extends BdApi.React.Component 
{
  constructor(props) 
  {
    super(props);
    this.state = { disabled: props.disabled ?? false };
  }
  render() 
  {
    return BdApi.React.createElement(
      'div',
      null,
      BdApi.React.createElement(
        'h3',
        { className: 'markup_a7e664 messageContent__21e69' },
        'This chat is yet to be encrypted. Please enter a passphrase so that a new PGP key pair can be generated.'
      ),
      BdApi.React.createElement('br'),
      BdApi.React.createElement('input', 
      {
        type: 'text',
        className: 'inputDefault__80165 input_d266e7',
        id: 'discord-pgp-passphrase-input',
        value: this.state.passphrase,
        onChange: this.handlePassphraseChange,
        placeholder: 'Passphrase',
      })
    );
  }
}

const eventManager = new EventEmitter();

function confirmCallback() 
{
  const passphrase = document.getElementById('discord-pgp-passphrase-input').value;
  eventManager.emit('confirmed-passphrase', passphrase);
  resolve(passphrase);
};

export function showPassphrasePrompt() 
{
  return new Promise((resolve) => {
    BdApi.showConfirmationModal(
      'Enter new PGP passphrase',
      BdApi.React.createElement(PromptPassphrase),
      { onConfirm: confirmCallback }
    );
  });
}