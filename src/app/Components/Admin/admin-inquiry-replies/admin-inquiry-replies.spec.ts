import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInquiryReplies } from './admin-inquiry-replies';

describe('AdminInquiryReplies', () => {
  let component: AdminInquiryReplies;
  let fixture: ComponentFixture<AdminInquiryReplies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInquiryReplies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminInquiryReplies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
