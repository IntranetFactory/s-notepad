import { alertController, popoverController } from '@ionic/core';
import { Component, ComponentInterface, h, Host } from '@stencil/core';
import '@vanillawc/wc-monaco-editor';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  scoped: true,
})
export class AppHome implements ComponentInterface {

  private _isAnyChangePending: boolean = false;
  private get isAnyChangePending() {
    return this._isAnyChangePending;
  }
  private set isAnyChangePending(value: boolean) {
    this._isAnyChangePending = value;
    this.updateAppTitle();
  }

  private _monacoEditorElement: HTMLElement;

  private get monacoEditorElement() {
    return this._monacoEditorElement;
  }
  private set monacoEditorElement(value: HTMLElement) {
    this._monacoEditorElement = value;
  }

  private _fileHandle: any;
  private get fileHandle() {
    return this._fileHandle;
  }
  private set fileHandle(value: any) {
    this._fileHandle = value;
    this.updateAppTitle();
  }

  private get editorContent() {
    return (this.monacoEditorElement as any).value;
  }
  private set editorContent(value: string) {
    (this.monacoEditorElement as any).value = value;
  }

  componentDidLoad() {
    window.addEventListener('beforeunload', event => {
      const message = 'You have unsaved changes, are you really sure to close the document?';
      event.returnValue = message;
    });
    (this.monacoEditorElement as any).editor.onDidChangeModelContent(() => this.isAnyChangePending = true);
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button onClick={event => this.showFileMenu(event)}>
                <ion-icon name="document" slot="start"></ion-icon>
                <ion-label>File</ion-label>
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

  private async showFileMenu(event: MouseEvent) {
    const popover = await popoverController.create({
      id: 'file-menu',
      component: 'app-file-menu',
      event: event,
      translucent: true,
      componentProps: {
        newFileHandler: () => this.createNew(),
        openFileHandler: () => this.openFile(),
        saveFileHandler: () => this.saveFile(),
        saveFileAsHandler: () => this.saveFile(true)
      }
    });
    await popover.present();
  }

  private async createNew() {
    await this.alertIfAnyPendingChange(() => {
      this.fileHandle = undefined;
      this.editorContent = '';
      this.isAnyChangePending = false;
    });
  }

  private async saveFile(saveAs?: boolean) {
    if (!this.fileHandle || saveAs) {
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
    this.isAnyChangePending = false;
  }

  private async openFile() {
    await this.alertIfAnyPendingChange(async () => {
      [this.fileHandle] = await (window as any).showOpenFilePicker();
      const content = await this.readFile();
      this.loadContentToEditor(content);
      this.isAnyChangePending = false;
    });
  }

  private async readFile() {
    const file = await this.fileHandle.getFile() as File;
    return await file.text();
  }

  private loadContentToEditor(content: string) {
    this.editorContent = content;
  }

  private async alertIfAnyPendingChange(continueHandler: () => void, cancelHandler?: () => void) {
    if (this.isAnyChangePending) {
      const alert = await alertController.create({
        header: 'You have unsaved changes',
        message: 'Do you really want to close current document without saving the changes?',
        buttons: [
          {
            text: 'No',
            handler: cancelHandler
          },
          {
            text: 'Yes',
            handler: continueHandler
          }
        ]
      });
      await alert.present();
    } else {
      continueHandler();
    }
  }

  private updateAppTitle() {
    if (this.fileHandle) {
      document.title = `${this.fileHandle.name}${this.isAnyChangePending ? '*' : ''} - SNotepad`;
    } else {
      document.title = `${this.isAnyChangePending ? '* - ' : ''}SNotepad`;
    }
  }

}
