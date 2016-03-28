import * as Enumerable from 'linq';
import {CommandHandler} from './command-handler';

export class CommandHandlerRegistry {
    private static _instance = null;
    private handlers: CommandHandler[] = [];

    static get instance(): CommandHandlerRegistry {
        return CommandHandlerRegistry._instance || (CommandHandlerRegistry._instance = new CommandHandlerRegistry());
    }

    getHandler(commandTypeName: string): CommandHandler {
        let handler = Enumerable
            .from(this.handlers)
            .firstOrDefault(x => x.handles(commandTypeName), null);

        if (!handler) {
            throw new Error(`Could not find handler for command type '${commandTypeName}'`);
        }

        return handler;
    }

    registerHandlers(...handlers: CommandHandler[]): this {
        handlers.forEach(handler => this.register(handler));
        return this;
    }

    register(handler: CommandHandler): this {
        let otherHandlerExists = Enumerable
            .from(this.handlers)
            .any(x => x.handles(handler.getCommandTypeName()));

        if (otherHandlerExists) {
            throw new Error(`Another handler already exists for command with name '${handler.getCommandTypeName()}'`);
        }

        this.handlers.push(handler);
        return this;
    }
}