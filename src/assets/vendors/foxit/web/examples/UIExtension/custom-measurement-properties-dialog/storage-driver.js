const EventEmitter = PDFViewCtrl.vendors.EventEmitter;
const MEASUREMENT_FEATURE = PDFViewCtrl.storage.StorageFeature.MEASUREMENT;
class LocalStorageDriver {
    constructor(instanceId) {
        this.measurementStorageStrategy = this.restoreStrategy(instanceId);
        this.eventEmitter = new EventEmitter();
    }
    getSpace(context) {
        const { id: instanceId, pdfViewer, feature } = context;
        if(feature === MEASUREMENT_FEATURE) {
            if(this.measurementStorageStrategy === 'page') {
                const docRender = pdfViewer.getPDFDocRender();
                if(!!docRender) {
                    const currentIndex = this.currentIndex === undefined ? docRender.getCurrentPageIndex() : this.currentIndex;
                    return [instanceId, context.feature, currentIndex].join('.')
                }
            }
        }

        return [instanceId, context.feature].join('.');
    }
    async getAll(context) {
        const space = this.getSpace(context);
        const keys = this.getSpaceKeys(context);
        return keys.reduce((result, completeKey) => {
            const key = completeKey.slice(space.length + 1);
            const rawData = localStorage.getItem(completeKey);
            result[key] = rawData ? JSON.parse(rawData) : null;
            return result;
        }, {});
    }
    async get(context, key) {
        const storageKey = this.generateUniqueKey(context, key);
        const valueStr = localStorage.getItem(storageKey);
        if(valueStr) {
            return JSON.parse(valueStr);
        } else {
            if(context.feature === MEASUREMENT_FEATURE && this.measurementStorageStrategy === 'page') {
                this.measurementStorageStrategy = 'app';
                try {
                    return this.get(context, key);
                } finally {
                    this.measurementStorageStrategy = 'page';
                }
            }
            return null;
        }
    }
    async set(context, key, value) {
        if(value === undefined || value === null) {
            return;
        }
        const storageKey = this.generateUniqueKey(context, key);
        const oldValueJSON = localStorage.getItem(storageKey);
        const oldValue = oldValueJSON ? JSON.parse(oldValueJSON) : undefined;
        const newValue = JSON.stringify(value);
        if(oldValueJSON === newValue) { // This is important to prevent infinite loops
            return;
        }
        localStorage.setItem(storageKey, newValue);
        this.emitChangeEvent({
            context,
            key,
            oldValue,
            newValue: value
        });
    }
    async removeAll(context) {
        const keys = this.getSpaceKeys(context);
        keys.forEach(key => {
            const oldValue = localStorage.getItem(key);
            localStorage.removeItem(key);
            const newValue = localStorage.getItem(key);
            if(newValue !== oldValue) {
                this.emitRemoveEvent({
                    context,
                    key
                });
            }
        });
    }
    async remove(context, key) {
        const storageKey = this.generateUniqueKey(context, key);
        const oldValue = localStorage.getItem(storageKey);
        localStorage.removeItem(storageKey);
        const newValue = localStorage.getItem(storageKey);
        if(newValue !== oldValue) {
            this.emitRemoveEvent({
                context, key
            });
        }
    }
    onChange(callback) {
        return this.addEventListener('change', callback);
    }
    onRemove(callback) {
        return this.addEventListener('remove', callback);
    }
    addEventListener(event, callback) {
        const listener = e => {
            callback(e);
        };
        this.eventEmitter.addListener(event, listener);
        return () => {
            this.eventEmitter.removeListener(event, listener);
        };
    }
    generateUniqueKey(context, key) {
        const space = this.getSpace(context);
        return [space, key].join('.');
    }
    getSpaceKeys(context) {
        const space = this.getSpace(context);
        const prefix = space + '.';
        return Array(localStorage.length)
        .fill(0)
        .map((_, index) => localStorage.key(index))
        .filter(it => !!it)
        .filter(it => it.indexOf(prefix) === 0);
    }
    emitChangeEvent(event) {
        this.eventEmitter.emit('change', event);
    }
    emitRemoveEvent(event) {
        this.eventEmitter.emit('remove', event);
    }
    forceEmitChangeEvent(context, key) {
        const storageKey = this.generateUniqueKey(context, key);
        const valueStr = localStorage.getItem(storageKey);
        let value;
        if(valueStr) {
            value = JSON.parse(valueStr);
        }
        this.emitChangeEvent({
            context,
            key,
            newValue: value,
            oldValue: value
        })
    }
    async updateMeasurementStorageStrategy(newStrategy, context){
        switch(newStrategy) {
            case 'app':
            case 'page':
                break;
            default:
                throw new Error('Incorrect measurement storage strategy: ' + newStrategy);
        }
        if(this.measurementStorageStrategy === newStrategy) {
            return;
        }
        const MEASUREMNT_INFO_KEY = 'measurement-info';
        const measurementInfo = await this.get(context, MEASUREMNT_INFO_KEY);
        this.measurementStorageStrategy = newStrategy;
        this.storeStrategy(context.id, newStrategy);
        await this.set(context, MEASUREMNT_INFO_KEY, measurementInfo);
    }
    getMeasurementStorageStrategy() {
        return this.measurementStorageStrategy;
    }
    setCurrentPageIndex(currentPageIndex) {
        this.currentIndex = currentPageIndex;
    }
    storeStrategy(instanceId) {
        const storageKey = `${instanceId}-storage-strategy`;
        return localStorage.setItem(storageKey, this.measurementStorageStrategy);
    }
    restoreStrategy(instanceId) {
        const storageKey = `${instanceId}-storage-strategy`;
        return localStorage.getItem(storageKey) || 'app';
    }
}
