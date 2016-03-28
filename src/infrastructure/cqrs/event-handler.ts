export interface IEventListener<TEvent extends Object> {
    eventType: string;

    handle(evt: TEvent): Promise<void>;
}