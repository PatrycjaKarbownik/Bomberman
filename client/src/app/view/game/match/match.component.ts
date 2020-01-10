import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import { MapModel } from '@app/view/game/models/map.model';
import { GameService } from '@app/view/game/game.service';
import { TileType } from '@app/view/game/models/tile-type.model';
import { CornerType } from '@app/view/game/models/corner-type.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';
import { BombModel } from '@app/view/game/models/bomb.model';
import { HeroModel } from '@app/view/game/models/hero.model';
import { UserId } from '@app/core/storages/user-details.storage';

@Component({
  selector: 'bomb-match',
  templateUrl: './match.component.pug',
  styleUrls: ['./match.component.scss'],
  animations: [
    trigger('up', [
      /*state('0', style({
        transform: 'translateY(0)'
      })),*/
      /*state('1', style({
        transform: 'translateY(calc(-75vh / 5))',
      })),*//*,
      state('2', style({
        // transform: 'translateY(calc(-75vh / 5))'
        top: "500px"
      })),*/
      transition('0 => 1', [animate('200ms'),
        style({
          transform: 'translateY(calc(-75vh / 5))',
          // top: "calc(-75vh / 5)"
        })]),
    ])
  ]
})
export class MatchComponent implements OnInit, AfterViewInit {

  @UserId() userId;
  private mapSize: number = 5;
  private mapHeight = 75;

  private map: MapModel;
  private bombs = new BehaviorSubject<BombModel[]>([]);
  private heroes: HeroModel[];
  // private clientHeroGameId: number;

  private up = 0;

  @ViewChild('hero0') public hero0: ElementRef;
  @ViewChild('hero1') public hero1: ElementRef;
  @ViewChild('hero2') public hero2: ElementRef;
  @ViewChild('hero3') public hero3: ElementRef;
  public clientHeroRef: ElementRef;
  public clientHero: HeroModel;

  TileType = TileType;
  CornerType = CornerType;

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.map = this.gameService.getMap();
    this.heroes = this.gameService.getHeroes();
    this.bombs.next([]);
  }

  ngAfterViewInit(): void {
    this.setHeroesPositions();
    this.setClientHero();
  }

  @HostListener('document:keydown', ['$event'])
  private handleKeyboardDown(event: KeyboardEvent) {
    if (event.code === 'ArrowUp') {
      this.moveUp();
      /*document.getElementById('clientHero').animate({
        top: "10px"
      });*/
      console.log('up', this.up);
      this.up = 1;
    } else if (event.code === 'ArrowDown') {
      this.moveDown();
    } else if (event.code === 'ArrowLeft') {
      this.moveLeft();
    } else if (event.code === 'ArrowRight') {
      this.moveRight();
    } else if (event.code === 'Space') {
      const hero = document.getElementById('clientHero');
      this.setBomb(hero.offsetLeft, hero.offsetTop);
    }
    console.log('down', event);
  }

  @HostListener('document:keyup', ['$event'])
  private handleKeyboardUp(event: KeyboardEvent) {
    if (event.code === 'ArrowUp') {
      this.up = 0;
      console.log('up', this.up, event);
      console.log(document.getElementById('clientHero'));
    }
  }

  private setHeroesPositions() {
    this.hero0.nativeElement.style.top = 'calc(0vh)';
    this.hero0.nativeElement.style.left = 'calc(0vh)';
    this.heroes.find(it => this.getCornerType(it.inGameId) === 0).top = this.hero0.nativeElement.style.top;
    this.heroes.find(it => this.getCornerType(it.inGameId) === 0).left = this.hero0.nativeElement.style.left;

    this.hero1.nativeElement.style.top = 'calc(0vh)';
    this.hero1.nativeElement.style.left = `calc(${this.mapHeight}vh - ${this.mapHeight}vh / ${this.mapSize})`;
    this.heroes.find(it => this.getCornerType(it.inGameId) === 1).top = this.hero1.nativeElement.style.top;
    this.heroes.find(it => this.getCornerType(it.inGameId) === 1).left = this.hero1.nativeElement.style.left;

    this.hero2.nativeElement.style.top = `calc(${this.mapHeight}vh - ${this.mapHeight}vh / ${this.mapSize})`;
    this.hero2.nativeElement.style.left = 'calc(0vh)';
    this.heroes.find(it => this.getCornerType(it.inGameId) === 2).top = this.hero2.nativeElement.style.top;
    this.heroes.find(it => this.getCornerType(it.inGameId) === 2).left = this.hero2.nativeElement.style.left;

    this.hero3.nativeElement.style.top = `calc(${this.mapHeight}vh - ${this.mapHeight}vh / ${this.mapSize})`;
    this.hero3.nativeElement.style.left = `calc(${this.mapHeight}vh - ${this.mapHeight}vh / ${this.mapSize})`;
    this.heroes.find(it => this.getCornerType(it.inGameId) === 3).top = this.hero3.nativeElement.style.top;
    this.heroes.find(it => this.getCornerType(it.inGameId) === 3).left = this.hero3.nativeElement.style.left;
  }

  private moveUp() {
    if (!this.isTopBoundary()) {
      let top = this.clientHeroRef.nativeElement.style.top;
      this.clientHeroRef.nativeElement.style.top = `calc(${top} - (${this.mapHeight}vh / ${this.mapSize}))`;
      this.clientHero.top = this.clientHeroRef.nativeElement.style.top;
    }
  }

  private moveDown() {
    if (!this.isBottomBoundary()) {
      let top = this.clientHeroRef.nativeElement.style.top;
      this.clientHeroRef.nativeElement.style.top = `calc(${top} + (${this.mapHeight}vh / ${this.mapSize}))`;
      this.clientHero.top = this.clientHeroRef.nativeElement.style.top;
    }
  }

  private moveLeft() {
    if (!this.isLeftBoundary()) {
      let left = this.clientHeroRef.nativeElement.style.left;
      this.clientHeroRef.nativeElement.style.left = `calc(${left} - (${this.mapHeight}vh / ${this.mapSize}))`;
      this.clientHero.left = this.clientHeroRef.nativeElement.style.left;
    }
  }

  private moveRight() {
    if (!this.isRightBoundary()) {
      let left = this.clientHeroRef.nativeElement.style.left;
      this.clientHeroRef.nativeElement.style.left = `calc(${left} + (${this.mapHeight}vh / ${this.mapSize}))`;
      this.clientHero.left = this.clientHeroRef.nativeElement.style.left;
    }
  }

  private setBomb(x: number, y: number) {
    console.log('set bomb at ', x, y);
    const bombs = this.bombs.getValue();
    bombs.push({
      x: x,
      y: y
    } as BombModel);
    this.bombs.next(bombs);
  }

  private isTopBoundary() {
    return this.clientHero.top === `calc(0vh)`;
  }

  private isBottomBoundary() {
    return this.clientHero.top === `calc(${this.mapHeight - this.mapHeight/this.mapSize}vh)`;
  }

  private isLeftBoundary() {
    return this.clientHero.left === `calc(0vh)`;
  }

  private isRightBoundary() {
    return this.clientHero.left === `calc(${this.mapHeight - this.mapHeight/this.mapSize}vh)`;
  }

  private isHeroWithIdPresent(id: number): boolean {
    return this.heroes.find(it => it.inGameId === id) !== undefined;
  }

  private getCornerType(inGameId: number): CornerType {
    return inGameId % 4;
  }

  private setClientHero() {
    this.clientHero = this.heroes.find(it => it.id === this.userId);

    if (this.getCornerType(this.clientHero.inGameId) === CornerType.LEFT_TOP) {
      this.clientHeroRef = this.hero0;
    } else if (this.getCornerType(this.clientHero.inGameId) === CornerType.RIGHT_TOP) {
      this.clientHeroRef = this.hero1;
    } else if (this.getCornerType(this.clientHero.inGameId) === CornerType.LEFT_BOTTOM) {
      this.clientHeroRef = this.hero2;
    }
    if (this.getCornerType(this.clientHero.inGameId) === CornerType.RIGHT_BOTTOM) {
      this.clientHeroRef = this.hero3;
    }

    console.log(this.clientHero);
  }
}
