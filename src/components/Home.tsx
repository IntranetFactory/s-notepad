import { CommandBar, ICommandBarItemProps, ThemeProvider } from '@fluentui/react';
import { languages } from 'monaco-editor';
import mousetrap from 'mousetrap';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { applyTheme, getActualFluentTheme, getActualTheme } from '../utils/theme';

import './Home.css';

let fileHandle: any;
let isAnyChangePending = false;
let isFileJustOpened = false;

export const Home: React.FunctionComponent = () => {
  const [editorValue, setEditorValue] = useState<string>('');
  const [editorLanguage, setEditorLanguage] = useState<string>('plaintext');
  const [editorLanguages, setEditorLanguages] = useState<languages.ILanguageExtensionPoint[]>();
  const [editorTheme] = useState<string>(getActualTheme() === 'light' ? 'vs-light' : 'vs-dark');

  useEffect(() => {
    applyTheme(getActualTheme());
    addKeyboardShortcuts();
  });

  function setFileHandle(value: any) {
    fileHandle = value;
    updateAppTitle();
  }


  function setIsAnyChangePending(value: any) {
    isAnyChangePending = value;
    updateAppTitle();
  }

  function getCommandBarFarItems(
    { editorLanguage, editorLanguages, setEditorLanguage }: {
      editorLanguages: languages.ILanguageExtensionPoint[] | undefined,
      editorLanguage: string,
      setEditorLanguage: React.Dispatch<React.SetStateAction<string>>
    }
  ) {
    return [
      {
        key: 'language',
        text: editorLanguages?.find(language => editorLanguage === language.id)?.aliases?.[0] || 'Loading...',
        subMenuProps: {
          items: editorLanguages?.map(language => ({
            key: language.id,
            text: language.aliases?.[0] || language.id,
            onClick: () => setEditorLanguage(language.id),
          })) || []
        },
      },
    ] as ICommandBarItemProps[];
  }

  function getCommandBarItems() {
    return [
      {
        key: 'file',
        text: 'File',
        iconProps: { iconName: 'TextDocument' },
        subMenuProps: {
          items: [
            {
              key: 'new',
              text: 'New',
              iconProps: { iconName: 'Document' },
              onClick: () => createNew(),
            },
            {
              key: 'open',
              text: 'Open',
              iconProps: { iconName: 'OpenFile' },
              onClick: () => openFile(),
            },
            {
              key: 'save',
              text: 'Save',
              iconProps: { iconName: 'Save' },
              onClick: () => saveFile(),
            },
            {
              key: 'saveAs',
              text: 'Save As',
              iconProps: { iconName: 'SaveAs' },
              onClick: () => saveFile(),
            },
            {
              key: 'exit',
              text: 'Exit',
              iconProps: { iconName: 'Leave' },
              onClick: () => exit(),
            },
          ],
        },
      },
      {
        key: 'settings',
        text: 'Settings',
        iconProps: { iconName: 'Settings' },
      },
      {
        key: 'share',
        text: 'Share',
        iconProps: { iconName: 'Share' },
        subMenuProps: {
          items: [
            {
              key: 'snapshot',
              text: 'Snapshot',
              iconProps: { iconName: 'Camera' },
            },
            {
              key: 'embed',
              text: 'Embed',
              iconProps: { iconName: 'Embed' },
            },
          ],
        },
      },
    ] as ICommandBarItemProps[];
  }

  async function createNew() {
    await alertIfAnyPendingChange(() => {
      setFileHandle(undefined);
      setEditorValue('');
      setIsAnyChangePending(false);
    });
  }

  async function openFile(fileHandle?: any) {
    await alertIfAnyPendingChange(async () => {
      setFileHandle(fileHandle || (await (window as any).showOpenFilePicker())?.[0]);
      const content = await readFile();
      loadContentToEditor(content);
      setIsAnyChangePending(false);
      isFileJustOpened = true;
    });
  }

  async function saveFile(saveAs?: boolean) {
    if (!fileHandle || saveAs) {
      fileHandle = await (window as any).showSaveFilePicker({
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
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(editorValue);
    await writableStream.close();
    setIsAnyChangePending(false);
  }

  async function exit() {
    await alertIfAnyPendingChange(() => {
      window.close();
    });
  }

  async function readFile() {
    const file = await fileHandle.getFile() as File;
    return await file.text();
  }

  function loadContentToEditor(content: string) {
    setEditorValue(content);
  }

  function updateAppTitle() {
    if (fileHandle) {
      document.title = `${fileHandle.name}${isAnyChangePending ? '*' : ''} - SNotepad`;
    } else {
      document.title = `${isAnyChangePending ? '* - ' : ''}SNotepad`;
    }
  }

  async function alertIfAnyPendingChange(continueHandler: () => void, cancelHandler?: () => void) {
    if (isAnyChangePending) {
      // const alert = await alertController.create({
      //   header: 'You have unsaved changes',
      //   message: 'Do you really want to close current document without saving the changes?',
      //   buttons: [
      //     {
      //       text: 'No',
      //       handler: cancelHandler
      //     },
      //     {
      //       text: 'Yes',
      //       handler: continueHandler
      //     }
      //   ]
      // });
      // await alert.present();
      continueHandler();
    } else {
      continueHandler();
    }
  }

  function addKeyboardShortcuts() {
    const executeAction = (event: mousetrap.ExtendedKeyboardEvent, shortcutHandler: () => void) => {
      event.preventDefault();
      shortcutHandler();
    };

    mousetrap.bind(['ctrl+n', 'command+n'], event => executeAction(event, () => createNew()));
    mousetrap.bind(['ctrl+o', 'command+o'], event => executeAction(event, () => openFile()));
    mousetrap.bind(['ctrl+s', 'command+s'], event => executeAction(event, () => saveFile()));
    mousetrap.bind(['ctrl+shift+s', 'command+shift+s'], event => executeAction(event, () => saveFile()));

    mousetrap.prototype.stopCallback = () => false;
  }


  return (
    <div id="main-container">
      <ThemeProvider id="theme-provider" theme={getActualFluentTheme()}>
        <CommandBar
          id="command-bar"
          items={getCommandBarItems()}
          farItems={getCommandBarFarItems({ editorLanguage, editorLanguages, setEditorLanguage })}
          ariaLabel="Use left and right arrow keys to navigate between commands"
        />
        <s-monaco-editor
          id="editor"
          value={editorValue}
          language={editorLanguage}
          theme={editorTheme}
          ref={el => {
            el?.addEventListener('didChangeModelContent', event => {
              if (isFileJustOpened) {
                isFileJustOpened = false;
              } else {
                setIsAnyChangePending(true);
              }
              setEditorValue((event.currentTarget as HTMLSMonacoEditorElement).value);
            });
            el?.addEventListener('componentLoad', event => {
              const detail = (event as CustomEvent).detail;

              setEditorLanguages(detail.monaco.languages.getLanguages());
            })
          }}
        ></s-monaco-editor>
      </ThemeProvider>
    </div>
  );
};
