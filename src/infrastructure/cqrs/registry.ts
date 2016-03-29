import {IDomainEvent} from './domain-event';
import {Validate} from '../../common/validator';
import {IEventListener} from './event-handler';
import {logger as mainLogger} from '../../common/logger';

const logger = mainLogger.namespace('ES.REGISTRY');

type HandlerMap = { [commandName: string]: () => ICommandHandler<any>; };
type ListenerMap = { [eventType: string]: (() => IEventListener<any>)[]; };
export type CommandHandlerDelegate<TCommand> = (command: TCommand) => Promise<IDomainEvent<any>[]>;
export type ListenerDelegate<TEvent extends IDomainEvent<any>> = (event: TEvent) => Promise<void>;
export type CommandHandlerDef = CommandHandlerDelegate<any> | ICommandHandler<any>;
export type EventListenerDef = IEventListener<any> | ListenerDelegate<any>;

export interface ICommandHandler<TCommand> {
    handle: CommandHandlerDelegate<TCommand>;
}

export interface IHandlerBuilder {
    handledBy(handler: CommandHandlerDef): Registry;
    handledByFactory(factory: () => CommandHandlerDef);
    handledByFactoryAsSingleton(factory: () => CommandHandlerDef): Registry;
}

export interface IListenerBuilder {
    triggers(listener: EventListenerDef): Registry;
    triggersFactory(factory: () => EventListenerDef): Registry;
    triggersFactoryAsSingleton(factory: () => EventListenerDef): Registry;
}

export class Registry {
    private static _instance = null;
    private handlers: HandlerMap = {};
    private listeners: ListenerMap = {};

    static get instance(): Registry {
        return Registry._instance || (Registry._instance = new Registry());
    }

    getHandler(commandName: string): ICommandHandler<any> {
        // Retrieve factory for command type
        let handlerFactory = this.handlers[commandName.toUpperCase()];
        if (!handlerFactory) {
            throw new Error(`Could not find handler for command type '${commandName}'`);
        }

        // Retrieve an instance for command type
        let instance = handlerFactory();
        if (!instance) {
            throw new Error(`Handler factory for command type '${commandName}' did not return an instance!`);
        }

        return instance;
    }

    getListeners(eventType: string): IEventListener<any>[] {
        // Get the listener factories for the event type
        let listenersArray = this.getListenersArrayFor(eventType);

        // Map those over to instantiate the actual listeners
        return listenersArray.map(factory => factory());
    }
    
    command(commandName: string): IHandlerBuilder {
        if (this.handlers[commandName]) {
            throw new Error(`Command name '${commandName}' is already handled by another handler.`);
        }

        let registry = this;
        return {
            handledBy(handler: CommandHandlerDef): Registry {
                // Make sure it's valid
                Validate.notNull(handler, new Error('Handler is required'));
                if (typeof handler !== 'function' && typeof handler['handle'] !== 'function') {
                    throw new Error('Handler must either be a function that takes a command or an object with a handle method that takes a command');
                }

                return this.handledByFactory(() => handler);
            },

            handledByFactory(factory: () => CommandHandlerDef): Registry {
                // Make sure it's a function
                if (typeof factory !== 'function') {
                    throw new Error('Must provide a factory function to create handler.');
                }

                // Register the handler
                registry.handlers[commandName.toUpperCase()] = () => {
                    let instance = factory();

                    // If factory didn't return anything, throw
                    if (!instance) {
                        throw new Error(`Handler factory did not return anything for command '${commandName}'`);
                    }

                    // If a handler function, wrap it in an object
                    if (typeof instance === 'function') {
                        return <ICommandHandler<any>>{
                            handle: instance
                        };
                    }

                    // If an instance object with a handle function, just return it
                    if (typeof instance['handle'] === 'function') {
                        return instance as ICommandHandler<any>;
                    }

                    // Throw an error if it's not one of the supported types
                    throw new Error(`Invalid handler for command type '${commandName}'. Handler must either be a function that takes a command or an object with a handle method that takes a command`);
                };

                logger.debug(`Command handler registered for '${commandName}'`);
                return registry;
            },

            handledByFactoryAsSingleton(factory: () => CommandHandlerDef): Registry {
                let instance: CommandHandlerDef = null;
                return this.handledByFactory(() => {
                    if (!instance) {
                        instance = factory();
                    }

                    return instance;
                })
            }
        };
    }

    event(eventType: string): IListenerBuilder {
        let registry = this;
        return {
            triggers(listener: EventListenerDef): Registry {
                // Make sure it's valid
                Validate.notNull(listener, new Error('Listener is required'));
                if (typeof listener !== 'function' && typeof listener['handle'] !== 'function') {
                    throw new Error('Event listener must either be a function that takes a command or an object with a handle method that takes an event.');
                }

                return this.triggersFactory(() => listener);
            },

            triggersFactory(factory: () => EventListenerDef): Registry {
                // Make sure it's a function
                if (typeof factory !== 'function') {
                    throw new Error('Must provide a factory function to create listener.');
                }

                // Register the handler
                let listeners = registry.getListenersArrayFor(eventType);
                listeners.push(() => {
                    let instance = factory();

                    // If factory didn't return anything, throw
                    if (!instance) {
                        throw new Error(`Listener factory did not return anything for event of type '${eventType}'`);
                    }

                    // If a handler function, wrap it in an object
                    if (typeof instance === 'function') {
                        return <IEventListener<any>>{
                            handle: instance
                        };
                    }

                    // If an instance object with a handle function, just return it
                    if (typeof instance['handle'] === 'function') {
                        return instance as IEventListener<any>;
                    }

                    // Throw an error if it's not one of the supported types
                    throw new Error(`Invalid event listener for event type '${eventType}'. Event listener must either be a function that takes an event or an object with a handle method that takes an event.`);
                });

                logger.debug(`Event listener registered for '${eventType}'`);
                return registry;
            },

            triggersFactoryAsSingleton(factory: () => EventListenerDef): Registry {
                let instance: EventListenerDef = null;
                return this.triggersFactory(() => {
                    if (!instance) {
                        instance = factory();
                    }

                    return instance;
                })
            }
        };
    }

    private getListenersArrayFor(eventType: string): (() => IEventListener<any>)[] {
        if (!eventType) {
            throw new Error('No event type passed');
        }

        var eventKey = eventType.toUpperCase();
        return this.listeners[eventKey] || (this.listeners[eventKey] = []);
    }
}