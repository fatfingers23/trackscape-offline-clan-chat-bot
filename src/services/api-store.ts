import fetch, {Headers} from 'node-fetch';
import {createRequire} from 'node:module';
import { createClient } from 'redis';

import { Logger } from './index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');


export class ApiStore {
    private fetchOptions = {
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Config.webApi.token}`,
        })
    };

    private redisClient = createClient({
        url: Config.redis,
        database: 1,
    });

    private redisKey = (key: string) : string => `discord-bot:${key}`;
    constructor() {
        this.redisClient.on('error', (error) => {
            Logger.error(error);
        });
        this.redisClient.connect();
    }
    public async getAllClans(): Promise<Array<Clan>> {
        const cacheKey = this.redisKey('clans');
        try {
            if(await this.redisClient.exists(cacheKey)) {
                return JSON.parse(await this.redisClient.get(cacheKey));
            }
            const result = await fetch(Config.webApi.baseUrl as string + `/bot/clans`, this.fetchOptions);
            const resultJson = await result.json();
            await this.redisClient.set(cacheKey, JSON.stringify(resultJson));
            return await resultJson as Array<Clan>;
        }catch ({message}){
            await Logger.error(message);
        }
    }
    public async getChannelIds(): Promise<Array<string>> {
        const cacheKey = this.redisKey('channels');

        if (await this.redisClient.exists(cacheKey)) {
            return JSON.parse(await this.redisClient.get(cacheKey));
        }
        const result = await this.getAllClans()
        let channelIds = result.map((clan) => clan.discord_message_channel);
        await this.redisClient.set(cacheKey, JSON.stringify(channelIds));
        return channelIds;
    }

    public sendChat(chatLog: ChatLog): void{
        const postOptions = {headers: this.fetchOptions.headers, body: JSON.stringify(chatLog), method: 'POST'};
        fetch(Config.webApi.baseUrl as string + `/chat/discord`, postOptions);
    }
}