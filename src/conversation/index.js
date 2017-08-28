import Rx from 'rxjs'

function createConversations ({ initialState, scanner, handler = () => { } }) {
  const subject = new Rx.Subject()
  const observers = { }

  return {
    notify: ({ userId, message }) => {
      if (!observers[userId]) {
        observers[userId] = subject
          .filter(data => data.userId === userId)
          .scan(scanner, initialState)
          .subscribe(handler)
      }
      subject.next({ userId, message })
    }
  }
}

export { createConversations }
