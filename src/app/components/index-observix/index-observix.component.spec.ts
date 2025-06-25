import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexObservixComponent } from './index-observix.component';

describe('IndexObservixComponent', () => {
  let component: IndexObservixComponent;
  let fixture: ComponentFixture<IndexObservixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexObservixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexObservixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
