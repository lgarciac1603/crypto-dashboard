import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WsService {
  connect() {
    console.log('WebSocket ready (no-op for now)');
  }
}
