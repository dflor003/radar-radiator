import {Router, Request, Response} from 'express';
import {ServiceGroupRepo} from '../persistence/service-group-repo';
import {HttpStatus} from '../common/http-status';
import {CommandBus} from '../infrastructure/cqrs/index';
import {RequestHandler} from 'express';
import {NextFunction} from 'express';
import {IServiceGroup} from '../evt-listeners/service-group-model-listener';
import {ServiceGroupCommands, ICreateServiceGroupCommand} from '../cmd-handlers/service-group-commands';
import * as express from 'express';
import {Validate} from '../common/validator';
import {NotFoundError} from '../common/errors/not-found-error';

function handleErrors(handler: RequestHandler): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await handler(req, res, next);
        } catch(err) {
            next(err);
        }
    }
}

export class ServiceGroupApi {
    private repo: ServiceGroupRepo;
    private bus: CommandBus;

    constructor(repo: ServiceGroupRepo = new ServiceGroupRepo(), bus: CommandBus = CommandBus.instance) {
        this.repo = repo;
        this.bus = bus;
    }

    routes(): Router {
        let router = express.Router();

        router.get('/api/service-groups', handleErrors((req, res, next) => this.getServiceGroups(req, res, next)));
        router.get('/api/service-groups/:id', handleErrors((req, res, next) => this.getServiceGroupById(req, res, next)));
        
        router.post('/api/service-groups', handleErrors((req, res) => this.createServiceGroup(req, res)));

        return router;
    }

    async getServiceGroups(req: Request, res: Response, next: Function): Promise<void> {
        let groups = await this.repo.getAll();
        res.json(groups.map(group => toServiceGroupSummary(group)))
    }

    async getServiceGroupById(req: Request, res: Response, next: Function): Promise<void> {
        let id = Validate.notEmpty(req.param('id')),
            group = await this.repo.getById(id);

        if (!group) {
            throw new NotFoundError(`No group with id ${id}`);
        }

        res.json(toServiceGroupSummary(group));
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