let firebaseConfig

export function initializeFirebaseConfig (config) {
  if (firebaseConfig) return
  firebaseConfig = config
}

export function getFirebaseConfig () {
  return firebaseConfig
}
