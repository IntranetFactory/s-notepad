import { Component, ComponentInterface, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
})
export class AppRoot implements ComponentInterface {

  connectedCallback() {
    document.body.classList.toggle('dark', true);
  }

  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route url="/" component="app-home" />
        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }

}
