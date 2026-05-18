import { TestBed } from '@angular/core/testing';
import { WsService } from './ws.service';

describe('WsService', () => {
  let service: WsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WsService],
    });
    service = TestBed.inject(WsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log WebSocket readiness when connect is called', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    service.connect();

    expect(consoleSpy).toHaveBeenCalledWith('WebSocket ready (no-op for now)');
    consoleSpy.mockRestore();
  });
});
