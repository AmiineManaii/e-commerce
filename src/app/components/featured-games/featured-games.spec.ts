import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedGames } from './featured-games';

describe('FeaturedGames', () => {
  let component: FeaturedGames;
  let fixture: ComponentFixture<FeaturedGames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedGames]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedGames);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
