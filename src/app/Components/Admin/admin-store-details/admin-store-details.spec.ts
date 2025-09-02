import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStoreDetails } from './admin-store-details';

describe('AdminStoreDetails', () => {
  let component: AdminStoreDetails;
  let fixture: ComponentFixture<AdminStoreDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStoreDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminStoreDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
