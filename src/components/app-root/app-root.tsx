import { Component, ComponentInterface, h } from '@stencil/core';
import { applyTheme, getActualTheme } from '../../global/theme';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
})
export class AppRoot implements ComponentInterface {

  connectedCallback() {
    applyTheme(getActualTheme());
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
