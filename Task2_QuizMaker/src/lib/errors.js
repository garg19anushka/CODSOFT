const MESSAGES = {
  'auth/email-already-in-use': 'That email is already registered. Try logging in instead.',
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
}

export function friendlyFirebaseError(error) {
  if (!error) return 'Something went wrong.'
  return MESSAGES[error.code] || error.message || 'Something went wrong.'
}
