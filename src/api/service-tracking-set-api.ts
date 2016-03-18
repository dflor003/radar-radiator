import {Router, Request, Response} from 'express';
import {TrackingSetRepository} from '../persistence/tracking-set-repository';
import * as express from 'express';
import {ServiceGroup} from '../domain/service-group';
import {ServiceState} from "../domain/service-state";

export class ServiceTrackingSetApi {
    private repo: TrackingSetRepository;

    constructor(repo: TrackingSetRepository = new TrackingSetRepository()) {
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