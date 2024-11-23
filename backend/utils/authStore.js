const { AsyncLocalStorage } = require('async_hooks');
const { auth_identifier } = require('../config/app');

const asyncLocalStorage = new AsyncLocalStorage();

const storageManager = {

  getStore: () => asyncLocalStorage.getStore(),
  run: (cb) => asyncLocalStorage.run(new Map(), cb),
  set: (key, value) => {
    const store = storageManager.getStore();
    if (store) {
      store.set(key, value);
    } 
    else {
      console.error('No async storage context is running.');
    }
  },
  get: (key) => {
    const store = asyncLocalStorage.getStore();
    return store ? store.get(key) : undefined;
  },
  authUser: () => {
    const store = asyncLocalStorage.getStore();
    return store ? store.get(auth_identifier) : undefined;
  },
};

module.exports = storageManager;
