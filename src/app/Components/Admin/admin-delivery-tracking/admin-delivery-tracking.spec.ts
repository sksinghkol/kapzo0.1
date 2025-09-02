import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDeliveryTracking } from './admin-delivery-tracking';

describe('AdminDeliveryTracking', () => {
  let component: AdminDeliveryTracking;
  let fixture: ComponentFixture<AdminDeliveryTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDeliveryTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDeliveryTracking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
