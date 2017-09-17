import { createFirebaseApp } from '../firebase'
import { createTodoApp } from './createTodoApp'
import moment from 'moment'

jest.mock('../firebase/createFirebaseApp')

const todoApp = createTodoApp()

describe('todoApp', () => {
  afterEach(() => {
    createFirebaseApp.__reset()
  })
  describe('add', () => {
    test('adds new todo when all option is defined', async () => {
      const userId = '1234abc'
      const duedate = moment().set({
        year: 2013,
        date: 13,
        month: 5,
        hour: 0,
        minute: 0,
        second: 0
      })
      await todoApp.add({
        userId,
        title: 'todo',
        duedate
      })
      const mockPushId = createFirebaseApp.__getMockPushId()
      expect(createFirebaseApp.__getMockData()).toEqual({
        todo: {
          [mockPushId]: {
            id: mockPushId,
            title: 'todo',
            ownerId: userId,
            duedate
          }
        },
        user: {
          [userId]: {
            todos: {
              [mockPushId]: true
            }
          }
        }
      })
    })
    test('safely adds new todo when only title option is defined', async () => {
      await todoApp.add({
        userId: '1234abc',
        title: 'todo'
      })
    })
    test('error when no title is defined', () => {
      expect(() => todoApp.add({ userId: '1234' })).toThrow(new Error('Title is not defined.'))
    })
  })
  describe('remove', () => {
    test('remove todo at specified id', async () => {
      const userId = '1234abc'
      await todoApp.add({
        userId,
        title: 'todo1'
      })
      const id1 = createFirebaseApp.__getMockPushId()
      await todoApp.add({
        userId,
        title: 'todo2'
      })
      const id2 = createFirebaseApp.__getMockPushId()
      await todoApp.remove({ id: id2 })
      expect(createFirebaseApp.__getMockData()).toEqual({
        todo: {
          [id1]: {
            id: id1,
            title: 'todo1',
            ownerId: userId,
            duedate: undefined
          }
        },
        user: {
          [userId]: {
            todos: {
              [id1]: true
            }
          }
        }
      })
    })
  })
})
