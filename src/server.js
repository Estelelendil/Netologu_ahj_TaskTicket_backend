const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaCors = require('koa-cors');
const Database = require('./database');
const initialData = require('./initialData');
const { checkHandlerMethod, HttpError } = require('./utils');

const database = new Database(initialData);
const app = new Koa();
const server = http.createServer(app.callback());
const port = 7070;

async function routeHandler(ctx) {
  const { method, id } = ctx.request.query;

  const { method: httpMethod, body } = ctx.request;

  let ticket;

  try {
    switch (method) {
      case 'allTickets':
        checkHandlerMethod(method, httpMethod, 'GET');
        ctx.response.body = database.allTickets();
        return;

      case 'ticketById':
        checkHandlerMethod(method, httpMethod, 'GET');
        ctx.response.body = { ticket: database.getTicketById(id) };
        return;

      case 'deleteTicketById':
        checkHandlerMethod(method, httpMethod, 'DELETE');

        ticket = database.deleteTicketById(id);

        ctx.response.body = { ticket, message: ticket == null ? 'Successfully deleted' : 'Not Found' };
        return;

      case 'createTicket':
        checkHandlerMethod(method, httpMethod, 'POST');

        ctx.response.body = { ticket: database.addNewTicket(body) };
        return;

      case 'editTicket':
        checkHandlerMethod(method, httpMethod, 'PATCH');

        ctx.response.body = { ticket: database.editTicketById(body, id) };
        return;

      default:
        throw new HttpError(404, `Method "${method} is not found"`);
    }
  } catch (error) {
    console.error(error);
    if (error instanceof HttpError) {
      const { status, message } = error;
      ctx.response.status = status;
      ctx.response.body = { status, message };
      return;
    }

    throw new Error('Internal Server Error');
  }
}

app
  .use(koaBody({
    urlencoded: true,
    multipart: true,
  }))
  .use(koaCors({ origin: '*', methods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'] }))
  .use(routeHandler);

server.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`server is worked at ${port}`);
});
