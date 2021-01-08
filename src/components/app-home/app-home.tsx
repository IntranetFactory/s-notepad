import { Component, ComponentInterface, h, Host } from '@stencil/core';
import '@vanillawc/wc-monaco-editor';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  scoped: true,
})
export class AppHome implements ComponentInterface {

  private monacoEditorElement: HTMLElement;
  private fileHandle: any;

  private get editorContent() {
    return (this.monacoEditorElement as any).value;
  }
  private set editorContent(value: string) {
    (this.monacoEditorElement as any).value = value;
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="dark">
            <ion-buttons>
              <ion-button onClick={() => this.openFile()}>
                <ion-icon name="open" slot="start"></ion-icon>
                <ion-label>Open</ion-label>
              </ion-button>
              <ion-button onClick={() => this.saveFile()}>
                <ion-icon name="save" slot="start"></ion-icon>
                <ion-label>Save</ion-label>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content scrollY={false}>
          <wc-monaco-editor
            ref={el => this.monacoEditorElement = el}
          ></wc-monaco-editor>
        </ion-content>
      </Host >
    );
  }

  private async saveFile() {
    if (!this.fileHandle) {
      this.fileHandle = await (window as any).showSaveFilePicker({
        types: [
          {
            description: 'Text Files',
            accept: {
              'text/plain': ['.txt'],
            },
          },
        ],
      });
    }
    const writableStream = await this.fileHandle.createWritable();
    await writableStream.write(this.editorContent);
    await writableStream.close();
  }

  private async openFile() {
    [this.fileHandle] = await (window as any).showOpenFilePicker();
    const content = await this.readFile();
    this.loadContentToEditor(content);
  }

  private async readFile() {
    const file = await this.fileHandle.getFile() as File;
    return await file.text();
  }

  private loadContentToEditor(content: string) {
    this.editorContent = content;
  }

}
