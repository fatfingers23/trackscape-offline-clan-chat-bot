import type Echo from 'laravel-echo';
import {createRequire} from 'node:module';
import Pusher from 'pusher-js';

import { CustomClient } from '../extensions/index.js';
import { Logger } from './index.js';

const require = createRequire(import.meta.url);

let EchoClient = require('laravel-echo');

let Config = require('../../config/config.json');

export class PusherService {

    echoClient: Echo;
    constructor(private discordClient: CustomClient) {
        // console.log(Config)
        const options = {
            broadcaster: 'pusher',
            key: Config.pusher.key,
            cluster: Config.pusher.cluster,
            forceTLS: Config.pusher.forceTLS,
            wsHost: Config.pusher.wsHost,
            wsPort: Config.pusher.wsPort,
            httpHost: Config.pusher.httpHost,
        };
        this.echoClient = new EchoClient.default({
            ...options,
            client:
                new Pusher(Config.pusher.key, options)
        })
    }


    public startListeners(): void{
        Logger.info('Pusher start')
        try {
            this.echoClient.channel('in-game-chat').listen('game.chat', e => Logger.info(`Message Received ${e.chat.sender}`));
        }catch (e) {
            Logger.error(e)
        }

    }

}