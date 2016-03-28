export interface IDomainEvent<T> {
    eventId: string;
    entityId: string;
    entityType: string;
    createdAt: Date;
    eventType: string;
    data: T;
}