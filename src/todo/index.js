import uniqid from 'uniqid'
export function createTodoApp (sendMessage) {
  const pendingUserDueDate = {
    /* userId: todoId */
  }
  const _isUserLastTodoDueDatePending = userId => !!pendingUserDueDate[userId]
  return {
    addTodo: ({ userId, title, dueDate }) => {
      const id = uniqid()
      sendMessage(userId, `Adding '${title}' to your todo list.`)

      _addTodo(userId, id, title, dueDate)
      if (!dueDate) {
        pendingUserDueDate[userId] = id
        sendMessage(userId, 'When do you want to have it finished?')
      }
    },
    updateTodoDueDate: ({ id, dueDate }) => {
      _updateTodoDueDate(id, dueDate)
    },
    isUserLastTodoDueDatePending: _isUserLastTodoDueDatePending,
    updateDuedateToPendingUser: ({ userId, dueDate }) => {
      if (_isUserLastTodoDueDatePending(userId)) {
        const id = pendingUserDueDate[userId]
        _updateTodoDueDate(id, dueDate)
        delete pendingUserDueDate[userId]
      }
    }
  }
}

function _addTodo (userId, id, title, dueDate) {
  console.log('Adding todo for user: %s, id: %s title: %s due-date: %s',
    userId, id, title, dueDate)
  // side-effect here
}

function _updateTodoDueDate (id, dueDate) {
  console.log('Updating todo for user: %s, id: %s due-date: %s',
    id, dueDate)
}
