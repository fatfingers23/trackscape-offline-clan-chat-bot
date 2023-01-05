import {Message} from 'discord.js';

import {EventData} from '../models/internal-models.js';
import {ApiStore} from '../services/api-store';
import {Logger} from '../services/logger.js';
import {Trigger} from './trigger.js';

export class NewMessageTrigger implements Trigger {
    requireGuild = true;
    private webClient: ApiStore;
    constructor(webClient: ApiStore) {
        this.webClient = webClient;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(msg: Message, data: EventData): Promise<void> {
        Logger.info(`New message from ${msg.author.username} in ${msg.channel.id}`);
        let chatLog: ChatLog ={
            sender: msg.member.nickname ?? msg.author.username,
            message: msg.content,
            discord_server: msg.guild.id,
            discord_channel: msg.channel.id,
        }
        this.webClient.sendChat(chatLog);
        return Promise.resolve(undefined);
    }

    async triggered(msg: Message): Promise<boolean> {
        const allowedChannels = await this.webClient.getChannelIds();
        return  allowedChannels.includes(msg.channel.id);
    }

}