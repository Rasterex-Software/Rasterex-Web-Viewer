
class Defer {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
class IndexedDBStorageDriver {
    constructor() {
        this.STORE_NAME = 'data';
        this.removeEventListeners = new Set();
        this.changeEventListeners = new Set();
        const request = window.indexedDB.open("MyTestDatabase", 1);
        const databaseDefer = new Defer();
        request.onerror = (event) => {
            databaseDefer.reject(event);
        };
        request.onsuccess = () => {
            databaseDefer.resolve(request.result);
        };
        request.onupgradeneeded = () => {
            const db = request.result;
            const store = db.createObjectStore(this.STORE_NAME);
            store.createIndex('id,feature,key', ['id', 'feature', 'key'], {
                unique: true
            });
        };
        this.databasePromise = databaseDefer.promise;
    }
    async useStore(callback) {
        const db = await this.databasePromise;
        return callback((readonly = false) => {
            return db
                .transaction([this.STORE_NAME], readonly ? 'readonly' : 'readwrite')
                .objectStore(this.STORE_NAME);
        });
    }
    async get(context, key) {
        return this.useStore(getStore => {
            return this.getValue(getStore(true), context, key);
        });
    }
    onChange(callback) {
        const entry = {
            callback
        };
        this.changeEventListeners.add(entry);
        return () => {
            this.changeEventListeners.delete(entry);
        };
    }
    async remove(context, key) {
        await this.useStore(async (getStore) => {
            const request = getStore().delete(IDBKeyRange.only(this.generateKeyArray(context, key)));
            const defer = new Defer();
            request.onerror = () => defer.reject(request.error);
            request.onsuccess = () => defer.resolve();
            await defer.promise;
            this.dispatchRemoveEvent(context, key);
        })
    }
    async removeAll(context) {
        await this.useStore(async getStore => {
            const allKeys = await this.getAllKeys(getStore(true), context);
            await Promise.all(allKeys.map(async key => {
                const request = getStore().delete(IDBKeyRange.only(key));
                const defer = new Defer();
                request.onerror = () => defer.reject(request.error);
                request.onsuccess = () => defer.resolve();
                await defer.promise;
                this.dispatchRemoveEvent(context, key);
            }))
        })
    }
    async set(context, key, newValue) {
        await this.useStore(async getStore => {
            const isTheKeyAlreadyExists = await this.has(context, key);
            const oldValue = isTheKeyAlreadyExists ? await this.getValue(getStore(true), context, key) : undefined;
            if(oldValue === newValue || JSON.stringify(oldValue) === JSON.stringify(newValue)) {
                // Avoid unnecessary updates
                return;
            }
            let request;
            if (isTheKeyAlreadyExists) {
                request = getStore().put(newValue, this.generateKeyArray(context, key));
            }else {
                request = getStore().add(newValue, this.generateKeyArray(context, key));
            }
            const defer = new Defer();
            request.onerror = () => defer.reject(request.error);
            request.onsuccess = () => defer.resolve();
            await defer.promise;
            this.dispatchChangeEvent({
                context, key, oldValue, newValue
            });
        })
    }
    async getAll(context) {
        return this.useStore(async getStore => {
            const allKeys = await this.getAllKeys(getStore(), context);
            const result = {};

            if(!allKeys.length) {
                return result;
            }

            await Promise.all(allKeys.map(async key => {
                const store = getStore();
                const request = store.get(IDBKeyRange.only(key));
                const defer = new Defer();
                request.onerror = () => defer.reject(request.error);
                request.onsuccess = () => defer.resolve(request.result);
                const value = await defer.promise
                result[key[2]] = value;
            }));
            return result;
        })
    }
    onRemove(callback) {
        const entry = {
            type: 'remove',
            callback
        };
        this.removeEventListeners.add(entry);
        return () => {
            this.removeEventListeners.delete(entry);
        };
    }
    async has(context, key) {
        return this.useStore(getStore => {
            const request = getStore().getKey(IDBKeyRange.only(this.generateKeyArray(context, key)));
            const defer = new Defer();
            request.onerror = () => defer.reject(request.error);
            request.onsuccess = () => defer.resolve(!!request.result);
            return defer.promise;
        });
    }
    generateKeyArray(context, key) {
        return [context.id || '', context.feature].concat(arguments.length === 2 ? [key || ''] : []);
    }
    getValue(store, context, key) {
        const keyRange = IDBKeyRange.only(this.generateKeyArray(context, key));
        const request = store.get(keyRange);
        const defer = new Defer();
        request.onerror = () => defer.reject(request.error);
        request.onsuccess = () => defer.resolve(request.result);
        return defer.promise;
    }
    async getAllKeys(store, context) {
        const request = store.getAllKeys(IDBKeyRange.lowerBound(this.generateKeyArray(context)));
        const allKeysDefer = new Defer();
        request.onerror = () => allKeysDefer.reject(request.error);
        request.onsuccess = () => allKeysDefer.resolve(request.result);
        const allKeys = await allKeysDefer.promise;
        const id = context.id || '';
        const feature = context.feature || '';
        return allKeys.filter(it => {
            return it[0] === id && it[1] === feature;
        });
    }
    dispatchRemoveEvent(context, key) {
        this.removeEventListeners.forEach(({ callback }) => {
            callback({
                context, key: key
            });
        });
    }
    dispatchChangeEvent(event) {
        this.changeEventListeners.forEach(({ callback }) => {
            callback({
                ...event
            });
        });
    }
}
