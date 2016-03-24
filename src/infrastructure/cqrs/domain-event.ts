export interface IDomainEvent<T> {
    eventId: string;
    entityId: string;
    entityType: string;
    data: T;
}