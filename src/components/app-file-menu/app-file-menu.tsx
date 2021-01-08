import { popoverController } from '@ionic/core';
import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'app-file-menu',
  styleUrl: 'app-file-menu.css',
  scoped: true,
})
export class AppFileMenu {

  @Prop() popoverId: string;
  @Prop() openFileHandler: () => void;
  @Prop() saveFileHandler: () => void;

  render() {
    return (
      <Host>
        <ion-content>
          <ion-list>
            <ion-item
              button
              onClick={() => {
                this.openFileHandler();
                this.dismissPopover();
              }}
            >
              <ion-icon slot="start" name="open"></ion-icon>
              <ion-label>Open</ion-label>
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
