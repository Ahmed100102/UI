import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalizeDashboardComponent } from './personalize-dashboard.component';

describe('PersonalizeDashboardComponent', () => {
  let component: PersonalizeDashboardComponent;
  let fixture: ComponentFixture<PersonalizeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalizeDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalizeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
