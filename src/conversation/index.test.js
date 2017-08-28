import { createConversations } from './index'

describe('conversation', () => {
  describe('createConversation', () => {
    test('scanner to be called', () => {
      const initialState = { message: '' }
      const scanner = jest.fn().mockImplementation((oldState, { message }) => ({
        message: oldState.message + message
      }))
      const conversation = createConversations({ initialState, scanner })
      conversation.notify({ userId: '0', message: 'hello' })
      conversation.notify({ userId: '0', message: 'itsme' })
      conversation.notify({ userId: '0', message: 'fromotherside' })
      expect(scanner.mock.calls).toEqual([
        [{'message': ''}, {'message': 'hello', 'userId': '0'}, 0],
        [{'message': 'hello'}, {'message': 'itsme', 'userId': '0'}, 1],
        [{'message': 'helloitsme'}, {'message': 'fromotherside', 'userId': '0'}, 2]
      ])
    })
  })
})
