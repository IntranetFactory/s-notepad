import { Component, Host, h, ComponentInterface, Prop, Event, EventEmitter, Method } from '@stencil/core';
import monacoLoader, { Monaco } from '@monaco-editor/loader';
import { editor, languages } from 'monaco-editor';

@Component({
  tag: 'app-monaco-editor',
  styleUrl: 'app-monaco-editor.css',
  shadow: false,
})
export class AppMonacoEditor implements ComponentInterface {

  private monaco: Monaco;
  private editorContainer: HTMLDivElement;
  private editor: editor.IStandaloneCodeEditor;

  @Prop() value: string;
  @Prop() language: string;
  @Prop() theme: string = 'vs-dark';

  @Event() didChangeModelContent: EventEmitter<editor.IModelContentChangedEvent>;

  async componentDidLoad() {
    monacoLoader.config({
      paths: {
        vs: './build/monaco-editor/vs'
      }
    });
    this.monaco = await monacoLoader.init();
    this.editor = this.monaco.editor.create(this.editorContainer, {
      value: this.value,
      language: this.language,
      theme: this.theme,
      automaticLayout: true
    });
    this.editor.onDidChangeModelContent(event => {
      this.value = this.editor.getValue();
      this.didChangeModelContent.emit(event);
    });
  }

  componentShouldUpdate(newValue: any, _oldValue: any, propName: string) {
    switch (propName) {
      case 'value':
        if (newValue !== this.editor.getValue()) {
          this.editor.setValue(newValue);
        }
        break;
      case 'language':
        this.monaco.editor.setModelLanguage(this.editor.getModel(), newValue);
        break;
      case 'theme':
        this.editor.updateOptions({ theme: newValue });
        break;
    }
    return false;
  }

  @Method()
  async getEditorLanguages() {
    return this.monaco.languages.getLanguages() as languages.ILanguageExtensionPoint[];
  }

  render() {
    return (
      <Host>
        <div
          id="editor-container"
          ref={el => this.editorContainer = el}
        ></div>
      </Host>
    );
  }

}
