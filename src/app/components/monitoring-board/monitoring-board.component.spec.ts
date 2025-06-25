import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringBoardComponent } from './monitoring-board.component';

describe('MonitoringBoardComponent', () => {
  let component: MonitoringBoardComponent;
  let fixture: ComponentFixture<MonitoringBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoringBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitoringBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
