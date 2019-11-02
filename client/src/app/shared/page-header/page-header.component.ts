import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bomb-page-header',
  templateUrl: './page-header.component.pug',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit {

  @Input() title;

  constructor() { }

  ngOnInit() { }

}
