import {CommandBus} from './command-bus';
import {Validate} from '../../common/validator';
import {IEventStore, InMemoryEventStore} from './event-store';

export class EventListener {
    private static _instance;
    private bus: CommandBus;
    private store: IEventStore;

    logEvents = true;

    constructor(bus: CommandBus = CommandBus.instance, store: IEventStore = new InMemoryEventStore()) {
        this.bus = Validate.notNull(bus);
        this.store = Validate.notNull(store);
    }

    static get instance(): EventListener {
        return EventListener._instance || (EventListener._instance = new EventListener());
    }
    
    init(): void {
        this.bus.on(CommandBus.EventsGeneratedEvent, evts => {
            this.store.saveEvents(evts);
            
        });
    }
}