import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacebookPage } from './facebook-page';

describe('FacebookPage', () => {
  let component: FacebookPage;
  let fixture: ComponentFixture<FacebookPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacebookPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacebookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
