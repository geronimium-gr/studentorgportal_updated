import { TestBed } from '@angular/core/testing';

import { EventzService } from './eventz.service';

describe('EventzService', () => {
  let service: EventzService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventzService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
