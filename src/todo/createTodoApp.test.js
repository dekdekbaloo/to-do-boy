import { createTodoApp } from './createTodoApp'

describe('To do app', () => {
  describe('getUserAction', () => {
    const todoApp = createTodoApp({
      addTodo: jest.fn(), updateTitle: jest.fn()
    })
    test('returns add action for a new user without existing data', () => {
      const action = todoApp.getUserAction(null, {
        userId: '1234',
        text: 'add todo'
      })
      expect(action).toEqual({
        topic: 'todo:add',
        userId: '1234',
        title: 'todo'
      })
    })
    test('returns update action for existing user with pending states', () => {
      const titlePendingState = {
        status: 'title:pending',
        todoId: '4567'
      }
      const updateTitleAction = todoApp.getUserAction(titlePendingState, {
        userId: '1234',
        text: 'todo'
      })

      expect(updateTitleAction).toEqual({
        topic: 'title:update',
        todoId: '4567',
        title: 'todo'
      })
      // TODO: Due date will depend on nlp.
      // const dueDatePendingState = {
      //   status: 'duedate:pending',
      //   todoId: '4567'
      // }
      // const updateDueDateAction = todoApp.getUserAction(dueDatePendingState, {
      //   userId: '1234',
      //   text:
      // })
    })
  })
  describe('performAction', () => {
    const todoApp = createTodoApp({
      addTodo: jest.fn(), updateTitle: jest.fn()
    })
    test('returns title pending state when no title recieved', () => {
      expect(todoApp.performAction({
        topic: 'todo:add',
        userId: '1234'
      })).toEqual(expect.objectContaining({ status: 'title:pending' }))
    })
    test('returns success status when an action is successfully performed', () => {
      expect(todoApp.performAction({
        topic: 'todo:add',
        userId: '1234',
        title: 'todo',
        duedate: 'today'
      })).toEqual(expect.objectContaining({ status: 'success' }))
    })
  })
  describe('accept', () => {
    const todoApp = createTodoApp({
      addTodo: jest.fn(),
      updateTitle: jest.fn(),
      getUserState: jest.fn()
        .mockImplementationOnce(() => null)
        .mockImplementationOnce(() => ({
          status: 'title:pending',
          todoId: '4567'
        }))
    })
    test('returns true when accepted', () => {
      expect(todoApp.accept({
        userId: '1234',
        text: 'add todo'
      })).toBe(true)
    })
  })
})
