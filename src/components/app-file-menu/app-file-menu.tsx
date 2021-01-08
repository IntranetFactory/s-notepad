import { popoverController } from '@ionic/core';
import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'app-file-menu',
  styleUrl: 'app-file-menu.css',
  scoped: true,
})
export class AppFileMenu {

  private get isStandaloneDisplayMode() {
    let isStandalone = false;
    if ((navigator as any).standalone) {
      isStandalone = true;
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isStandalone = true;
    }
    return isStandalone;
  }


  @Prop() popoverId: string;
  @Prop() newFileHandler: () => void;
  @Prop() openFileHandler: () => void;
  @Prop() saveFileHandler: () => void;
  @Prop() saveFileAsHandler: () => void;
  @Prop() exitHandler: () => void;

  render() {
    return (
      <Host>
        <ion-content>
          <ion-list>
            <ion-item
              button
              onClick={() => {
                this.newFileHandler();
                this.dismissPopover();
              }}
            >
              <ion-icon slot="start" name="create"></ion-icon>
              <ion-label>New</ion-label>
              {
                this.isStandaloneDisplayMode &&
                <ion-label slot="end" color="medium">Ctrl+N</ion-label>
              }
            </ion-item>
            <ion-item
              button
              onClick={() => {
                this.openFileHandler();
                this.dismissPopover();
              }}
            >
              <ion-icon slot="start" name="open"></ion-icon>
              <ion-label>Open</ion-label>
              <ion-label slot="end" color="medium">Ctrl+O</ion-label>
            </ion-item>
            <ion-item
              button
              onClick={() => {
                this.saveFileHandler();
                this.dismissPopover();
              }}
            >
              <ion-icon slot="start" name="save"></ion-icon>
              <ion-label>Save</ion-label>
              <ion-label slot="end" color="medium">Ctrl+S</ion-label>
            </ion-item>
            <ion-item
              button
              onClick={() => {
                this.saveFileAsHandler();
                this.dismissPopover();
              }}
            >
              <ion-icon slot="start" name="save"></ion-icon>
              <ion-label>Save As</ion-label>
              <ion-label slot="end" color="medium">Ctrl+Shift+S</ion-label>
            </ion-item>
            <ion-item
              button
              onClick={() => {
                this.exitHandler();
                this.dismissPopover();
              }}
            >
              <ion-icon slot="start" name="exit"></ion-icon>
              <ion-label>Exit</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </Host>
    );
  }

  private async dismissPopover() {
    await popoverController.dismiss(undefined, undefined, this.popoverId);
  }

}
