import { TestBed } from '@angular/core/testing';

import { VarientService } from './varient.service';

describe('VarientService', () => {
  let service: VarientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VarientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
