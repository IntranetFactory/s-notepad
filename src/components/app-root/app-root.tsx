import { Component, ComponentInterface, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
})
export class AppRoot implements ComponentInterface {

  render() {
    return (
      <ion-app>
        <ion-router useHash={true}>
          <ion-route url="/" component="app-home" />
          <ion-route url="/snapshot/:editorLanguage/:sharedContentBase64" component="app-home" />
          <ion-route url="/embed" component="app-embed" />
        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }

}
