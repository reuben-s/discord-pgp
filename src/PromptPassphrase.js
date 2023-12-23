export class PromptPassphrase extends BdApi.React.Component {
  constructor(props) {
    super(props);
    this.state = {disabled: props.disabled ?? false};
  }
  render() {
    return BdApi.React.createElement(
      'div',
      null,
      BdApi.React.createElement(
        'h3',
        { className: 'markup_a7e664 messageContent__21e69' },
        'This chat is yet to be encrypted. Please enter a passphrase so that a new PGP key pair can be generated.'
      ),
      BdApi.React.createElement('br'),
      BdApi.React.createElement('input', {
        type: 'text',
        className: 'inputDefault__80165 input_d266e7',
        value: this.state.passphrase,
        onChange: this.handlePassphraseChange,
        placeholder: 'Passphrase',
      })
    );
  }
}