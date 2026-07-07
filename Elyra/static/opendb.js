export function openDB(object,store) {
    let dbInstance = null;
    return new Promise((resolve, reject) => {

        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(store, 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(store)) {

                const store = db.createObjectStore(object, {
                    keyPath: "id",
                    autoIncrement: true
                });

                store.createIndex("wish", "wish", {
                    unique: true
                });
            }
        };

        request.onsuccess = function (event) {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onerror = function (event) {
            console.error(event.target.error);
            reject(event.target.error);
        };

    });
};