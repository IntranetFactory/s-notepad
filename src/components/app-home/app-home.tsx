import { alertController, popoverController } from '@ionic/core';
import { Component, ComponentInterface, h, Host, Prop } from '@stencil/core';
import mousetrap from 'mousetrap';
import pako from 'pako';

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

  private get baseUrl() {
    return window.location.origin.replace(window.location.hash, '');
  }

  @Prop() sharedContentBase64: string;

  componentDidLoad() {
    window.addEventListener('beforeunload', event => {
      if (this.isAnyChangePending) {
        const message = 'You have unsaved changes, are you really sure to close the document?';
        event.returnValue = message;
      }
    });

    // TODO find out a way that do not need to use setTimeout
    setTimeout(() => {
      if (this.sharedContentBase64) {
        const encodedBuffer = this.base64ToBuffer(this.sharedContentBase64.replace(/-/g, '/'));
        const inflatedBuffer = pako.inflate(encodedBuffer);
        this.editorContent = new TextDecoder('utf8').decode(inflatedBuffer);
      }
      (this.monacoEditorElement as any).editor.onDidChangeModelContent(() => this.isAnyChangePending = true);
    }, 500);

    this.addKeyboardShortcuts();
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
            <ion-buttons slot="end">
              <ion-button
                title="Share a snapshot"
                onClick={() => this.shareSnapshot()}
              >
                <ion-icon slot="icon-only" name="share"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content scrollY={false}>
          <wc-monaco-editor
            ref={el => this.monacoEditorElement = el}
            onDragover={event => event.preventDefault()}
            onDrop={async event => {
              event.preventDefault();
              for (const item of event.dataTransfer.items) {
                if (item.kind === 'file') {
                  const fileHandle = await item.getAsFileSystemHandle();
                  if (fileHandle.kind === 'file') {
                    await this.openFile(fileHandle);
                  } else {
                    const alert = await alertController.create({
                      header: 'Unsupported Type',
                      message: 'Opening a direcotory is not supported.',
                      buttons: ['OK']
                    });
                    await alert.present();
                  }
                }
              }
            }}
          ></wc-monaco-editor>
        </ion-content>
      </Host >
    );
  }

  private shareSnapshot() {
    const deflatedText = pako.deflate(new TextEncoder().encode(this.editorContent));
    const base64String = this.bufferToBase64(deflatedText);
    navigator.share({
      title: document.title,
      text: document.title,
      url: `${this.baseUrl}#/share/${base64String}`
    });
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
        saveFileAsHandler: () => this.saveFile(true),
        exitHandler: () => this.exit()
      }
    });
    await popover.present();
  }

  private async exit() {
    await this.alertIfAnyPendingChange(() => {
      window.close();
    });
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

  private async openFile(fileHandle?: any) {
    await this.alertIfAnyPendingChange(async () => {
      this.fileHandle = fileHandle || (await (window as any).showOpenFilePicker())?.[0];
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

  private addKeyboardShortcuts() {
    const executeAction = (event: mousetrap.ExtendedKeyboardEvent, shortcutHandler: () => void) => {
      event.preventDefault();
      shortcutHandler();
    };

    mousetrap.bind(['ctrl+n', 'command+n'], event => executeAction(event, () => this.createNew()));
    mousetrap.bind(['ctrl+o', 'command+o'], event => executeAction(event, () => this.openFile()));
    mousetrap.bind(['ctrl+s', 'command+s'], event => executeAction(event, () => this.saveFile()));
    mousetrap.bind(['ctrl+shift+s', 'command+shift+s'], event => executeAction(event, () => this.saveFile(true)));

    mousetrap.prototype.stopCallback = () => false;
  }

  private bufferToBase64(buffer: Uint8Array) {
    var binstr = Array.prototype.map.call(buffer, function (character) {
      return String.fromCharCode(character);
    }).join('');
    return btoa(binstr);
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
