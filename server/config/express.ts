import * as express from 'express';
import * as expressLogging from 'express-logging';
import * as logger from 'logops';
import { join } from 'path';
import * as favicon from 'serve-favicon';
import { json, urlencoded } from 'body-parser';

import { votacaoRouter } from '../routes';

export const app: express.Application = express();

// Log config - express-logging
app.use(expressLogging(logger));
logger.info('** LOGGER INICIALIZADO');

// Disable header: X-Powered-By:Express
app.disable('x-powered-by');
app.use(favicon(join(__dirname, '../../../client/src', 'favicon.ico')));

// dist/client - Saída do angular-cli
app.use(express.static(join(__dirname, '../../../dist')));

app.use(json());
app.use(urlencoded({ extended: true }));


// ****** API routes  ******
app.use('/api/votacao', votacaoRouter);


// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {

    app.use(function(err, req: express.Request, res: express.Response, next: express.NextFunction) {
        res.status(err.status || 500);
        res.json({
            error: err,
            message: err.message
        });
    });
}

app.use('/*', function(request: express.Request, response: express.Response) {
    response.sendFile(join(__dirname, '../../../dist', 'index.html'));
});

// // Porta que o express irá escutar as requisições
// const port = process.env.PORT || 3002;

// // Iniciar o servidor na porta especificada
// app.listen(port, () => {
//     // Mensagem de inicialização com sucesso
//     logger.info(`## Escutando no endereço: http://localhost:${port}/`);
// });

// catch 404 and forward to error handler
// app.use(function(req: express.Request, res: express.Response, next) {
//     let err = new Error("Not Found");
//     next(err);
// });

// production error handler
// no stacktrace leaked to user
// app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
//     res.status(err.status || 500);
//     res.json({
//         error: {},
//         message: err.message
//     });
// });
