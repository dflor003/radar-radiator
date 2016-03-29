export const ServiceGroupCommands = {
    CreateServiceGroup: 'CreateServiceGroup',
    AddService: 'AddService'
};

export interface ICreateServiceGroupCommand {
    name: string;
}

export interface IAddServiceCommand {
    groupId: string;
    serviceName: string;
    url: string;
}