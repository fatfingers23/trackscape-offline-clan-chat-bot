import { Message } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';

import { EventDataService } from '../services/index.js';
import { Trigger } from '../triggers/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class TriggerHandler {
    private rateLimiter = new RateLimiter(
        Config.rateLimiting.triggers.amount,
        Config.rateLimiting.triggers.interval * 1000
    );

    constructor(private triggers: Trigger[], private eventDataService: EventDataService) {}

    public async process(msg: Message): Promise<void> {
        // Check if user is rate limited
        let limited = this.rateLimiter.take(msg.author.id);
        if (limited) {
            return;
        }

        // Find triggers caused by this message

        let triggers: Array<Trigger> = [];
        for (let trigger of this.triggers) {
            if (trigger.requireGuild && !msg.guild) {
                continue;
            }

            let runTrigger = !await trigger.triggered(msg)
            if (runTrigger) {
                continue;
            }
            triggers.push(trigger);
        }

        if (triggers.length === 0) {
            return;
        }

        // Get data from database
        let data = await this.eventDataService.create({
            user: msg.author,
            channel: msg.channel,
            guild: msg.guild,
        });

        // Execute triggers
        for (let trigger of triggers) {
            await trigger.execute(msg, data);
        }
    }

    private async asyncMap<T, U>(array: T[], callback: (element: T) => Promise<U>): Promise<U[]> {
        const results: U[] = [];
        for (const element of array) {
            results.push(await callback(element));
        }
        return results;
    }

}
