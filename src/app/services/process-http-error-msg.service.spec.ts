import { TestBed } from '@angular/core/testing';

import { ProcessHttpErrorMsgService } from './process-http-error-msg.service';

describe('ProcessHttpErrorMsgService', () => {
  let service: ProcessHttpErrorMsgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessHttpErrorMsgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
