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
        <ion-router useHash={true}>
          <ion-route url="/" component="app-home" />
          <ion-route url="/snapshot/:editorLanguage/:sharedContentBase64" component="app-home" />
        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }

}
