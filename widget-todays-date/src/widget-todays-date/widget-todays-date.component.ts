import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'widget-todays-date',
  template: `
  <div class="container">
    <div class="h_iframe">
        <iframe  src="http://localhost:3000/" frameborder="0" allowfullscreen></iframe>
    </div>
  </div>
  `,
  styles:['.h_iframe iframe {position:absolute;top:0;left:0;width:100%; height:100%;}']
})
export class WidgetTodaysDateComponent implements OnInit {

  currentDate: Date = new Date();

  constructor() { }

  ngOnInit() {
  }

}
