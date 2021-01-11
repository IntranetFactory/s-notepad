import { Component, Host, h, ComponentInterface } from '@stencil/core';
import pako from 'pako';

@Component({
  tag: 'app-embed',
  styleUrl: 'app-embed.css',
  scoped: true,
})
export class AppEmbed implements ComponentInterface {

  private _searchParams: URLSearchParams;
  private get searchParams() {
    if (!this._searchParams) {
      this._searchParams = new URLSearchParams(window.location.href.match(/[^\?]*$/)[0]);
    }
    return this._searchParams;
  }

  get editorValue() {
    const encodedBuffer = this.base64ToBuffer(this.searchParams.get('value').replace(/-/g, '/').replace(/\s/g, '+'));
    const inflatedBuffer = pako.inflate(encodedBuffer);
    return new TextDecoder('utf8').decode(inflatedBuffer);
  }

  render() {
    return (
      <Host>
        <app-monaco-editor
          value={this.editorValue}
          language={this.searchParams.get('language')}
          theme={this.searchParams.get('theme')}
          readOnly={JSON.parse(this.searchParams.get('readOnly'))}
        ></app-monaco-editor>
      </Host>
    );
  }

  private base64ToBuffer(base64: string) {
    var binstr = atob(base64);
    var buffer = new Uint8Array(binstr.length);
    Array.prototype.forEach.call(binstr, function (character, i) {
      buffer[i] = character.charCodeAt(0);
    });
    return buffer;
  }

}
