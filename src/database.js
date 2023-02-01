const {
  isValidUuid, HttpError, generateUuid, parseTicket,
} = require('./utils');

class Database {
  tickets = [];

  constructor(initialTickets) {
    if (typeof initialTickets === 'object' && Array.isArray(initialTickets)) {
      this.tickets.push(...initialTickets);
    }
  }

  addNewTicket(body) {
    const { name, description, status } = parseTicket(body);
    const id = generateUuid();
    const created = new Date().toISOString();

    const newTicket = {
      id,
      name,
      description,
      status,
      created,
    };

    this.tickets.push(newTicket);

    return newTicket;
  }

  allTickets() {
    return this.tickets.map(({
      id, name, status, created,
    }) => ({
      id, name, status, created,
    }));
  }

  getTicketById(id) {
    if (!isValidUuid(id)) {
      throw new HttpError(400, 'Invalid id was provided');
    }

    return this.tickets.find((ticket) => id === ticket.id);
  }

  deleteTicketById(id) {
    if (!isValidUuid(id)) {
      throw new HttpError(400, 'Invalid id was provided');
    }
    const indexToDelete = this.tickets.findIndex((ticket) => ticket.id === id);

    if (indexToDelete === -1) {
      return undefined;
    }

    return this.tickets.splice(indexToDelete, 1)[0];
  }

  editTicketById(body, id) {
    if (!isValidUuid(id)) {
      throw new HttpError(400, 'Invalid id was provided');
    }

    const { name, description, status } = parseTicket(body);
    const indexToEdit = this.tickets.findIndex((ticket) => ticket.id === id);

    if (indexToEdit === -1) {
      return undefined;
    }

    const ticket = this.tickets[indexToEdit];

    ticket.name = name;
    ticket.description = description;
    ticket.status = status;

    return ticket;
  }
}

module.exports = Database;
