let db;

const request = indexedDB.open('budgetDB', 1);

request.onupgradeneeded = function() {
    db = request.result;
    db.createObjectStore('transactions', { autoIncrement: true });
};

request.onsuccess = function() {
  // when db is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
   db = request.result;
   console.log('index db connected')
  // check if app is online, if yes run checkDatabase() function to send all local db data to api
  if (navigator.onLine) {
    upLoadTransactions();
  }
};

request.onerror = function() {
  // log error here
  console.error('No able to connect with Indexdb');
};

function saveTransactions(transactions, isAdding) {
  
  const transaction = db.transaction(['transactions'], 'readwrite');

  const tStore = transaction.objectStore('transactions');

  // add record to your store with add method.
  tStore.add(transactions);
  if(isAdding) {
    alert("Your deposits have been made. Your updated transactions will be visible once you reconnect")
  } else {
    alert('Your withdrawls/spendings have been made. Your updated transactions will be visible once you reconnect')
  }
}

function upLoadTransactions() {
  console.log('Uploading Offline Transactions');
  // open a transaction on your pending db
  const transaction = db.transaction(['transactions'], 'readwrite');

  // access your pending object store
  const tStore = transaction.objectStore('transactions');

  // get all records from store and set to a variable
  const getAll = tStore.getAll();

  getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      alert('Uploading Offline Transactions')

      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => {response.json()
        console.log('fetch response from storeall', response)})
        .then(serverResponse => {
          console.log('inside server REsponse')
          // if (serverResponse.message) {
          //   throw new Error(serverResponse);
          // }
          const transaction = db.transaction(['transactions'], 'readwrite');
          const tStore = transaction.objectStore('transactions');
          // clear all items in your store
          console.log('tSTore before clear', tStore);
          tStore.clear();
          
        })
        .catch(err => {
          // set reference to redirect back here
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', upLoadTransactions);

