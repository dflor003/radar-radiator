import {Router, Request, Response} from 'express';
import {ServiceGroupRepo} from '../persistence/service-group-repo';
import {HttpStatus} from '../common/http-status';
import {CommandBus} from '../infrastructure/cqrs/index';
import {RequestHandler} from 'express';
import {NextFunction} from 'express';
import {IServiceGroup} from '../evt-listeners/service-group-model-listener';
import {ServiceGroupCommands, ICreateServiceGroupCommand} from '../cmd-handlers/service-group-commands';
import * as express from 'express';

function handleErrors(handler: RequestHandler): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await handler(req, res, next);
        } catch(err) {
            next(err);
        }
    }
}

export class ServiceGroupQueryApi {
    private repo: ServiceGroupRepo;

    constructor(repo: ServiceGroupRepo = new ServiceGroupRepo()) {
        this.repo = repo;
    }

    routes(): Router {
        let router = express.Router();

        router.get('/api/service-groups', handleErrors((req, res, next) => this.getServiceGroups(req, res, next)));
        router.get('/api/service-groups/:id', handleErrors((req, res, next) => this.getServiceGroupById(req, res, next)));

        return router;
    }

    getServiceGroups(req: Request, res: Response, next: Function): void {
        let groups = this.repo.getAll();
        res.json(groups.map(group => toServiceGroupSummary(group)))
    }

    getServiceGroupById(req: Request, res: Response, next: Function): void {
        res.status(HttpStatus.NotImplemented).send('');
    }
}

export class ServiceGroupCommandApi {
    private bus: CommandBus;

    constructor(bus: CommandBus = CommandBus.instance) {
        this.bus = bus;
    }

    routes(): Router {
        let router = express.Router();

        router.post('/api/service-groups', handleErrors((req, res) => this.createServiceGroup(req, res)));

        return router;
    }

    async createServiceGroup(req: Request, res: Response): Promise<void> {
        let body = req.body || {},
            name = body.name;

        await this.bus.process<ICreateServiceGroupCommand>(ServiceGroupCommands.CreateServiceGroup, {
            name: name
        });
        res.status(HttpStatus.Accepted).send(null);
    }
}

function toServiceGroupSummary(group: IServiceGroup): Object {
    return {
        id: group.id,
        name: group.name
    };
}