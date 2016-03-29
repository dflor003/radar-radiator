import * as express from 'express';
import * as favicon from 'serve-favicon';
import * as path from 'path';
import * as morgan from 'morgan';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as socketIo from 'socket.io';
import lessMiddleware = require('less-middleware');
import {Request, Response} from 'express';
import {Utils} from './common/utils';
import {esManager} from './infrastructure/cqrs/event-sourcing-manager';
import {CreateServiceGroupHandler, CreateServiceGroupCommand} from './cmd-handlers/create-service-group-handler';
import {ServiceGroupModelListener} from './evt-listeners/service-group-model-listener';
import {ServiceGroupCommandApi, ServiceGroupQueryApi} from './api/service-group-api';
import {logger} from './common/logger';
import {AddServiceHandler, AddServiceCommand} from './cmd-handlers/add-service-handler';
import {ServiceGroup} from './domain/service-group';

function start(workingDir?: string): void {
    workingDir = workingDir || __dirname;
    // Setup
    let app = express(),
        serverPort = 3000,
        debug = true;


    // View Engine setup
    app.set('views', path.join(workingDir, 'views'));
    app.set('view engine', 'jade');

    // Configuration
    app.disable('etag'); // Disables etags for JSON requests
    // app.use(favicon(workingDir + '/public/assets/favicon.ico'));
    app.use(morgan('dev', { stream: logger.toStream() }));
    app.use(lessMiddleware(path.join(workingDir, 'public'), {
        force: true,
        debug: debug,
    }));
    app.use(bodyParser.json());
    app.use(express.static(path.join(workingDir, 'public'), { etag: true }));

    // Initialize Event Sourcing infrastructure
    esManager
        .configure(registry => {
            let serviceGroupListener = new ServiceGroupModelListener();
            registry
                .command(CreateServiceGroupCommand.name).handledBy(new CreateServiceGroupHandler())
                .command(AddServiceCommand.name).handledBy(new AddServiceHandler())
                .event(ServiceGroup.Events.ServiceGroupCreated).triggers(evt => serviceGroupListener.handleCreated(evt))
                .event(ServiceGroup.Events.ServiceAdded).triggers(evt => serviceGroupListener.handleServiceAdded(evt));
        })
        .start();

    // Main SPA route
    app.get('/', (req: Request, res: Response) => res.render('layout', {}));

    // APIs
    let controllers = [
        new ServiceGroupCommandApi(),
        new ServiceGroupQueryApi(),
    ];
    controllers.forEach(ctrl => app.use(ctrl.routes()));

    // Error handlers
    app.use((req: Request, res: Response, next: Function) => {
        var message = `Could not find resource: ${req.url}`,
            err = new Error(message);
        err['status'] = 404;
        next(err);
    });

    app.use((err: Error, req: Request, res: Response, next:Function) => {
        let errorId = Utils.uuid();
        res.status(err['status'] || 500);
        res.send({
            id: errorId,
            message: err.message,
            stack: debug === true ? err.stack.split('\n') : undefined
        });
    });

    // Setup server
    let port = serverPort;
    app.set('port', port);
    let server = http.createServer(app);

    logger.info(`Server listening on port ${port}`);
    server.listen(port);
    server.on('error', (error: any) => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        let bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // Handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                logger.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });

    server.on('listening', () => {
        let addr = server.address(),
            bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
        logger.info('Listening on ' + bind);
    });
}
start(path.join(__dirname, '../'));