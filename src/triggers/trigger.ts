import { Message } from 'discord.js';

import { EventData } from '../models/internal-models.js';

export interface Trigger {
    requireGuild: boolean;
    triggered(msg: Message): Promise<boolean>;
    execute(msg: Message, data: EventData): Promise<void>;
}
