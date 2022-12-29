import  { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';

import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';



export class SetClanCommand implements Command {
    public names = ['set-clan-name'];
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction): Promise<void> {
        let args = {
            clanName: intr.options.getString('clan-name')
        };

        let embed: EmbedBuilder = new EmbedBuilder();
        embed.setTitle(`You picked the clan name: ${args.clanName}`);
        await InteractionUtils.send(intr, embed);
    }
}
