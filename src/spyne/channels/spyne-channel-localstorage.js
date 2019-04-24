import { Channel } from './channel';
import {Subject} from 'rxjs';
import {partition, map} from 'rxjs/operators';
import {prop} from 'ramda';

export class SpyneChannelLocalstorage extends Channel {


    constructor(props = {}) {
        super('CHANNEL_LOCALSTORAGE', props);
    }

    onChannelInitialized() {
        super.onChannelInitialized();
    }

    createLocalStorageObj() {
       return window.spyne.config.WINDOW;
    }


    addWindowChannel() {
        const beforeUnloadFilter = p => p.action === 'CHANNEL_WINDOW_BEFOREUNLOAD_EVENT';
        let windowObs$ = this.getChannel('CHANNEL_WINDOW').
        pipe(rxjs.operators.partition(beforeUnloadFilter));

        windowObs$.pipe(
            rxjs.operators.map(this.createLocalStorageObj)).
        subscribe(this.setStorage.bind(this));

    }

    addRegisteredActions() {
        return [
            'CHANNEL_LOCALSTORAGE_GET_EVENT',
            'CHANNEL_LOCALSTORAGE_SET_EVENT'
        ];
    }

    getStorageItems() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) ||
            this.setStorage();
    }

    setStorage(obj = []) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
        return obj;
    }

    onViewStreamInfo(obj) {
        let data = obj.viewStreamInfo;
        let action = data.action;
        let payload = prop('srcElement', data);
        payload['action'] = action;
        this.onSendEvent(action, payload);
    }

    onSendEvent(actionStr, payload = {}) {
        const action = this.channelActions[actionStr];
        const srcElement = {};
        const event = undefined;
        const delayStream = () => this.sendChannelPayload(action, payload, srcElement, event);
        window.setTimeout(delayStream, 0);
    }
}
