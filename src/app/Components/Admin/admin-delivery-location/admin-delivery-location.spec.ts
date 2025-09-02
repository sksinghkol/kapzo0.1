import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDeliveryLocation } from './admin-delivery-location';

describe('AdminDeliveryLocation', () => {
  let component: AdminDeliveryLocation;
  let fixture: ComponentFixture<AdminDeliveryLocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDeliveryLocation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDeliveryLocation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
