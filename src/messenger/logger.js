export function messageRecieved (event) {
  const { sender, recipient, timeOfMessage, message } = event
  const senderID = sender.id
  const recipientID = recipient.id
  console.log('Received message for user %d and page %d at %d with message:',
    senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))
}

export function messageSent (data) {
  const { messageId, recipientId } = data
  console.log('Successfully sent generic message with id %s to recipient %s',
    messageId, recipientId)
}
