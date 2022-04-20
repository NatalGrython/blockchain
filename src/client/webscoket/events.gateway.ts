import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { ApiService } from '../api/api.service';

@WebSocketGateway({ namespace: 'events', cors: { origin: '*' } })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  mappedIds: { [id: string]: NodeJS.Timer };

  constructor(private apiService: ApiService) {
    this.mappedIds = {};
  }

  handleDisconnect(client: Socket) {
    const timerId = this.mappedIds[client.id];
    clearInterval(timerId);
  }

  handleConnection(client: Socket, ...args: any[]) {
    const id = setInterval(async () => {
      const chain = await firstValueFrom(this.apiService.getFullChain());
      client.emit('chain', chain);
    }, 5000);
    this.mappedIds[client.id] = id;
  }

  @OnEvent('block')
  onBlockCreate(payload: any) {
    this.server.emit('block', payload);
  }
  @OnEvent('mining')
  onMining(payload: any) {
    this.server.emit('mining', payload);
  }
  @OnEvent('transaction')
  onCreateTransaction(payload: any) {
    this.server.emit('transaction', payload);
  }
  @OnEvent('owner')
  onGetOwner(payload: any) {
    this.server.emit('owner', payload);
  }

  @OnEvent('user')
  onCreateUser(payload: any) {
    this.server.emit('user', payload);
  }

  @OnEvent('balance')
  onGetBalance(payload: any) {
    this.server.emit('balance', payload);
  }
}
