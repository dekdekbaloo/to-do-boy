const commands = {
  add: 'todo:add',
  updateTitle: 'title:update'
}

const createTodoApp = model => {
  const parseArguments = (userId, text) => {
    const [ topic, ...args ] = text.split(' ')
    if (commands[topic]) {
      return {
        topic: commands[topic],
        userId,
        title: args.join(' ')
      }
    }
    return null
  }

  const getUserAction = (userState, { userId, text }) => {
    if (!userState) return parseArguments(userId, text)
    switch (userState.status) {
      case 'title:pending': return {
        topic: 'title:update',
        todoId: userState.todoId,
        title: text
      }
      default: return null
    }
  }
  const performAction = action => {
    switch (action.topic) {
      case 'todo:add':
        model.addTodo({
          userId: action.userId,
          title: action.title,
          duedate: action.duedate
        })
        if (!action.title) {
          return {
            status: 'title:pending'
            // todoId
          }
        }
        if (!action.duedate) {
          return {
            status: 'duedate:pending'
            // todoId
          }
        }
        return { status: 'success' }
      case 'title:update':
        model.updateTitle({
          todoId: action.todoId,
          title: action.title
        })
        return { status: 'success' }
    }
  }
  return {
    accept: ({ userId, text, reply }) => {
      const action = getUserAction(model.getUserState(userId), {
        userId, text
      })
      if (action) {
        performAction(action)
        return true
      }
      return false
    },
    performAction,
    getUserAction
  }
}

export { createTodoApp }
