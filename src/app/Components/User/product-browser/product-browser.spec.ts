import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBrowserComponent } from './product-browser';

describe('ProductBrowserComponent', () => {
  let component: ProductBrowserComponent;
  let fixture: ComponentFixture<ProductBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBrowserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});