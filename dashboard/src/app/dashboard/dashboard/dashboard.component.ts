/**
 * Set existing vendor modules into SystemJS registry.
 * This way SystemJS won't make HTTP requests to fetch imported modules
 * needed by the dynamicaly loaded Widgets.
 */
import { System } from 'systemjs';
declare const SystemJS: System;

import * as angularCore from '@angular/core';
import * as angularCommon from '@angular/common';
import * as angularCommonHttp from '@angular/common/http';
import * as angularForms from '@angular/forms';
import * as angularAnimations from '@angular/animations';
import * as angularPlatformBrowser from '@angular/platform-browser';
import * as angularPlatformBrowserDynamic from '@angular/platform-browser-dynamic';
import { Paho } from 'ng2-mqtt/mqttws31';

SystemJS.set('@angular/core', SystemJS.newModule(angularCore));
SystemJS.set('@angular/common', SystemJS.newModule(angularCommon));
SystemJS.set('@angular/common/http', SystemJS.newModule(angularCommonHttp));
SystemJS.set('@angular/forms', SystemJS.newModule(angularForms));
SystemJS.set('@angular/animations', SystemJS.newModule(angularAnimations));
SystemJS.set('@angular/platform-browser', SystemJS.newModule(angularPlatformBrowser));
SystemJS.set('@angular/platform-browser-dynamic', SystemJS.newModule(angularPlatformBrowserDynamic));

SystemJS.config({ meta: { '*': { authorization: true } } });
/** --------- */

import { AfterViewInit, Component, Compiler, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { WidgetConfig } from '../widget-config.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  client;
  widgets;
  @ViewChild('content', { read: ViewContainerRef }) content: ViewContainerRef;

  constructor(private compiler: Compiler, private dashboardService: DashboardService,
    private injector: Injector) {
    this.client = new Paho.MQTT.Client('iot.eclipse.org', 80,'/ws', 'qwerty12345');

    this.onMessage();
    this.onConnectionLost();
    this.client.connect({ onSuccess: this.onConnected.bind(this) });
  }
  onConnected() {
    console.log("Connected");
    this.client.subscribe("dashboard");
    //this.sendMessage('HelloWorld');
  }

  sendMessage(message: string) {
    let packet = new Paho.MQTT.Message(message);
    packet.destinationName = "dashboard";
    this.client.send(packet);
  }

  onMessage() {
    this.client.onMessageArrived = (message: Paho.MQTT.Message) => {
      console.log('Message arrived : ' + message.payloadString);
      this.loadWidget(message.payloadString);
    };
  }

  onConnectionLost() {
    this.client.onConnectionLost = (responseObject: Object) => {
      console.log('Connection lost : ' + JSON.stringify(responseObject));
    };
  }
  ngAfterViewInit() {
    this.getWidgets();    
  }
  private async loadWidget(name: string){
    let widget = this.widgets.filter(function(widget){return widget.name == name});
    if(widget.length > 0){
      this.createWidget(widget[0]);
    }
  }
  private async getWidgets(){
    this.widgets = await this.dashboardService.getWidgetConfigs().toPromise();
  }

  private async loadWidgets() {    
    this.widgets.forEach((widget) => this.createWidget(widget));
  }

  private async createWidget(widget: WidgetConfig) {
    // import external module bundle
    console.log(`Importing module bundle: ${widget.moduleBundlePath}`);
    const module = await SystemJS.import(widget.moduleBundlePath + '?v=' + widget.version);

    // compile module
    const moduleFactory = await this.compiler.compileModuleAsync(module[widget.moduleName]);

    // resolve component factory
    const moduleRef = moduleFactory.create(this.injector);
    const componentProvider = moduleRef.injector.get(widget.name);
    const componentFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(componentProvider);

    // compile component
    console.log(`Creating widget: ${widget.name}`);
    this.content.createComponent(componentFactory);
  }

}
