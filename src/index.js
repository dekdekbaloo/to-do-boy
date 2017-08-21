import app from './app'
import { initializeFirebaseConfig } from './utils/firebaseConfig'

export function createApp (config) {
  initializeFirebaseConfig(config)
  return app
}
