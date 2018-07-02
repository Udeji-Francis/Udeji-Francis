class Database {

  constructor() {
    this.state = {
      db: null,
      favorites: []
    }

    this.createDB();
    this.get();
  }

  createDB() {
    let request = indexedDB.open(["currencies"], 1);
    request.onupgradeneeded = e => {
      let db = e.target.result;

      if(!db.objectStoreNames.contains('favorites')) {
        let store = db.createObjectStore('favorites', {keyPath: 'id', autoIncrement: true});
        store.createIndex('currencyid', 'currencyid', {unique:false});
        store.createIndex('currencyindex', 'currencyindex', {unique:false});
        store.createIndex('currencyname', 'currencyname', {unique:false});
        store.createIndex('currencyrate', 'currencyrate', {unique:false});
      }
    }

    request.onsuccess = e => {
      this.state.db = e.target.result;
      console.log("[successfully created db]");
      this.getAllFavorites();
    }

    request.onerror = e => {
      console.log('[db not created]');
    }
  }


  addToFavorites(currency) {

    let transaction = this.state.db.transaction(["favorites"], 'readwrite');
    let store = transaction.objectStore("favorites");

    let request = store.add(currency);

    request.onsuccess = e => {
      console.log("[added currency to db]");
      this.getAllFavorites();
    }

    request.onerror = e => {
      console.log("[failed to add currency to db]", e.target.error.name);
    }

  }

  get() {
    if(this.state.favorites.length > 0) {
      return this.state.favorites;
    } else {
      return null;
    }
  }

  getAllFavorites() {

    let transaction = this.state.db.transaction(["favorites"], 'readwrite');
    let store = transaction.objectStore("favorites");
    let index = store.index('currencyname');

    index.openCursor().onsuccess = e => {
      let cursor = e.target.result;
      if(cursor) {
        this.state.favorites.push(cursor.value);
        cursor.continue();
      }
    }
    //return this.state.favorites;

  }


}



