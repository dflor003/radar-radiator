import {Router, Request, Response} from 'express';
import {ServiceGroupRepo} from '../persistence/service-group-repo';
import * as express from 'express';
import {ServiceGroup} from '../domain/service-group';
import {ServiceState} from "../domain/service-state";

export class ServiceGroupApi {
    private repo: ServiceGroupRepo;

    constructor(repo: ServiceGroupRepo = new ServiceGroupRepo()) {
        this.repo = repo;
    }

    routes(): Router {
        let router = express.Router();

        return router;
    }

    getTrackingSets(req: Request, res: Response, next: Function): void {
        let sets = this.repo.getAll();
    }

    getTrackingSetById(req: Request, res: Response, next: Function): void {

    }

    newTrackingSet(req: Request, res: Response, next: Function): void {

    }
}

function toServiceGroupDto(group: ServiceGroup): Object {
    return {
        name: group.name,
        status: ServiceState[group.overallState()],
    };
}