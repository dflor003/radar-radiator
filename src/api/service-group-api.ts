import {Router, Request, Response} from 'express';
import {ServiceGroupRepo} from '../persistence/service-group-repo';
import {ServiceGroup} from '../domain/service-group';
import {ServiceState} from '../domain/service-state';
import {HttpStatus} from '../common/http-status';
import {CreateServiceGroupCommand} from '../domain/commands/create-service-group-cmd';
import {CommandBus} from '../infrastructure/cqrs/index';
import * as express from 'express';

export class ServiceGroupQueryApi {
    private repo: ServiceGroupRepo;

    constructor(repo: ServiceGroupRepo = new ServiceGroupRepo()) {
        this.repo = repo;
    }

    routes(): Router {
        let router = express.Router();

        router.get('/api/service-groups', (req, res, next) => this.getServiceGroups(req, res, next));
        router.get('/api/service-groups/:id', (req, res, next) => this.getServiceGroupById(req, res, next));

        return router;
    }

    getServiceGroups(req: Request, res: Response, next: Function): void {
        let groups = this.repo.getAll();
        res.json(groups.map(group => toServiceGroupDto(group)))
    }

    getServiceGroupById(req: Request, res: Response, next: Function): void {
        res.status(HttpStatus.NotImplemented).send('');
    }
}

export class ServiceGroupCommandApi {
    private bus: CommandBus;

    constructor(bus: CommandBus = new CommandBus()) {
        this.bus = bus;
    }

    routes(): Router {
        let router = express.Router();

        router.post('/api/service-groups', (req, res, next) => this.createServiceGroup(req, res, next));

        return router;
    }

    async createServiceGroup(req: Request, res: Response, next: Function): Promise<void> {
        let body = req.body || {},
            name = body.name;
        
        let cmd = new CreateServiceGroupCommand(name);
        await this.bus.processCommand(cmd);
        res.send(HttpStatus.Accepted, null);
    }
}

function toServiceGroupDto(group: ServiceGroup): Object {
    return {
        name: group.name,
        status: ServiceState[group.overallState()],
    };
}