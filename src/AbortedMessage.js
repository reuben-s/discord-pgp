class AbortedMessage extends BdApi.React.Component 
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
        'span',
        { 
            className: 'markup_a7e664 messageContent__21e69',
            style: { color: 'red' }
        },
        'Message send has been aborted.'
      ),
      BdApi.React.createElement('br'),
      BdApi.React.createElement(
        'span',
        { className: 'markup_a7e664 messageContent__21e69' },
        'Recipient has not yet provided their public key.'
      ),
    );
  }
}

export function showAbortedMessage()
{
    return BdApi.UI.alert('Failed to send encrypted message', BdApi.React.createElement(AbortedMessage));
}