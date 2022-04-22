// create a variable to hold db connection
let db;
// estab a connection to IndexedDB db and set to vers 1
const request = indexedDB.open('budget_tracker', 1);

// create the object sotre that contains the data
request.onupgradeneeded = (e) => {
  // save a ref to the db
  const db = e.target.result;
  // create an object store, set it to have auto-incrementing primary key
  db.createObjectStore('new_trans', { autoIncrement: true });
};


// upon a successful request
request.onsuccess = (e) => {
  // when db is created w its object store
  db = e.target.result;
  // check if app is online. if it is, send all local db data to api
  if (navigator.online) {
    uploadTransaction();
  }
}

// upon an error on request
request.onerror = (e) => {
  // just console.log the error
  console.log(e.target.errorCode);
}

// if user attempts to submit new entry and there's no internet connection
let saveRecord = (record) => {
  // open a new transaction w db w read and write permission
  const transaction = db.transaction(['new_trans'], 'readwrite');
  // access the object store
  const transactionObjectStore = transaction.objectStore('new_trans');

  // add this new record to the object store
  transactionObjectStore.add(record);
}

// a function that uploads the new transaction when we come back online
let uploadTransaction = () => {
  // open a transaction on the db
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  // access the object store
  const transactionObjectStore = transaction.objectStore('new_transaction');
  // get all records from store
  const getAll = transactionObjectStore.getAll();
  // upon a successfull .getAll(), run this
  getAll.onsuccess = () => {
    // if there's data in the store, send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        // open another transaction
        const transaction = db.transaction(['new_trans'], 'readwrite');
        // access the new object store
        const transactionObjectStore = transaction.objectStore('new_trans');
        // clearr items in the store
        transactionObjectStore.clear();
        alert('All transactions have been submitted!');
      })
      .catch(err => {
        console.log(err);
      })
    }
  }
}

// listen for app coming back onlnie
window.addEventListener('online', uploadTransaction);