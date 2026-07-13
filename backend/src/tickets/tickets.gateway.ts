import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TicketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`[SocketsGateway] Client browser connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[SocketsGateway] Client browser disconnected: ${client.id}`);
  }

  emitTicketUpdate(ticketId: string, status: string, meta: any = {}) {
    this.server.emit('ticket_pipeline_event', {
      ticketId,
      status,
      ...meta,
    });
  }
}
