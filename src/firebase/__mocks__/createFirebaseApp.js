import _ from 'lodash'
import path from 'path'
import uniqid from 'uniqid'

let mockData = { }
let mockPushId = null

const keyToPath = key => key.replace(/\//g, '.')
const refStub = (refParam = '') => ({
  push: () => {
    mockPushId = uniqid()
    return { ref: 'new_ref', key: mockPushId }
  },
  update: updater => {
    Object.keys(updater)
      .forEach(key => {
        const refPath = keyToPath(path.join(refParam, key))
        updater[key] === null
          ? _.unset(mockData, refPath, updater[key])
          : _.set(mockData, refPath, updater[key])
      })
  },
  once: () => Promise.resolve({
    val: () => _.get(mockData, keyToPath(refParam))
  })
})

const createFirebaseApp = () => ({
  db: {
    ref: refStub
  }
})

createFirebaseApp.__getMockData = () => mockData
createFirebaseApp.__getMockPushId = () => mockPushId
createFirebaseApp.__setMockData = data => { mockData = data }
createFirebaseApp.__reset = () => { mockData = {} }

export { createFirebaseApp }
