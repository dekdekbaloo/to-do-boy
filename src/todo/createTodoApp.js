import { createFirebaseApp } from '../firebase'

function createTodoApp () {
  const { db } = createFirebaseApp()
  return {
    add: ({ userId, title, duedate }) => {
      if (!title) throw new Error('Title is not defined.')
      const id = db.ref('todo').push().key
      db.ref().update({
        ['todo/' + id]: {
          id,
          title,
          duedate,
          ownerId: userId
        },
        ['user/' + userId + '/todos/' + id]: true
      })
    },
    remove: async ({ id }) => {
      const snapshot = await db.ref('todo/' + id).once('value')
      const todo = snapshot.val()
      console.log('todo', todo)
      db.ref().update({
        ['todo/' + id]: null,
        ['user/' + todo.ownerId + '/todos/' + id]: null
      })
    },
    complete: ({ id }) => {

    },
    reopen: ({ id }) => {

    },
    update: ({ id, content }) => {

    }
  }
}

export { createTodoApp }
