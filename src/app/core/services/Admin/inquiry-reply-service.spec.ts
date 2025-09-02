import { TestBed } from '@angular/core/testing';

import { InquiryReplyService } from './inquiry-reply-service';

describe('InquiryReplyService', () => {
  let service: InquiryReplyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InquiryReplyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
