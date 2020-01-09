import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import { MapModel } from '@app/view/game/models/map.model';
import { GameService } from '@app/view/game/game.service';
import { TileType } from '@app/view/game/models/tile-type.model';
import { CornerType } from '@app/view/game/models/corner-type.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject, of, ReplaySubject, Subject } from 'rxjs';
import { BombModel } from '@app/view/game/models/bomb.model';

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

  private map: MapModel;
  private bombs = new BehaviorSubject<BombModel[]>([]);
  private up = 0;

  @ViewChild('clientHero') public clientHero: ElementRef;

  TileType = TileType;
  CornerType = CornerType;

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.map = this.gameService.getMap();
    this.bombs.next([]);
  }

  ngAfterViewInit(): void {
    console.log(this.clientHero);
    this.clientHero.nativeElement.style.top = 'calc(75vh - 75vh / 5)';
    this.clientHero.nativeElement.style.left = 'calc(75vh - 75vh / 5)';
  }

  getCornerType(): CornerType {
    let userInGameId = 3;

    return userInGameId % 4;
  }

  @HostListener('document:keydown', ['$event'])
  private handleKeyboardDown(event: KeyboardEvent) {
    console.log(document.getElementById('clientHero').offsetTop);
    if (event.code === 'ArrowUp') {
      this.moveUp();
      /*document.getElementById('clientHero').animate({
        top: "10px"
      });*/
      console.log('up', this.up);
      this.up = 1;
    } else if(event.code === 'ArrowDown') {
      this.moveDown();
    } else if(event.code === 'ArrowLeft') {
      this.moveLeft();
    } else if(event.code === 'ArrowRight') {
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

  private moveUp() {
    let top = this.clientHero.nativeElement.style.top;
    this.clientHero.nativeElement.style.top = `calc(${top} - (75vh / 5))`;
  }

  private moveDown() {
    let top = this.clientHero.nativeElement.style.top;
    this.clientHero.nativeElement.style.top = `calc(${top} + (75vh / 5))`;
  }

  private moveLeft() {
    let left = this.clientHero.nativeElement.style.left;
    this.clientHero.nativeElement.style.left = `calc(${left} - (75vh / 5))`;
  }

  private moveRight() {
    let left = this.clientHero.nativeElement.style.left;
    this.clientHero.nativeElement.style.left = `calc(${left} + (75vh / 5))`;
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
  }
