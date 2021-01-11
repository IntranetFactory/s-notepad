import { Component, Host, h, State, ComponentInterface, Prop } from '@stencil/core';
import { getActualTheme, getTheme, setTheme } from '../../global/theme';

@Component({
  tag: 'app-setting-menu',
  styleUrl: 'app-setting-menu.css',
  scoped: true,
})
export class AppSettingMenu implements ComponentInterface {

  @State() theme: 'light' | 'dark' | 'system' = getTheme();

  @Prop() updateEditorThemeHandler: (theme: 'light' | 'dark') => void;

  render() {
    return (
      <Host>
        <ion-content>
          <ion-list>
            <ion-item>
              <ion-label>Theme</ion-label>
              <ion-select
                interface="popover"
                value={this.theme}
                onIonChange={({ detail }) => {
                  this.theme = detail.value;
                  setTheme(detail.value);
                  this.updateEditorThemeHandler(getActualTheme());
                }}
              >
                <ion-select-option value="light">Light</ion-select-option>
                <ion-select-option value="dark">Dark</ion-select-option>
                <ion-select-option value="system">System Default</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>
        </ion-content>
      </Host>
    );
  }

}
