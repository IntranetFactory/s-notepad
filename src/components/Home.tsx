import { BaseButton, Button, CommandBar, DefaultButton, Dialog, DialogFooter, DialogType, ICommandBarItemProps, IDialogContentProps, IModalProps, PrimaryButton, ThemeProvider } from '@fluentui/react';
import { languages } from 'monaco-editor';
import mousetrap from 'mousetrap';
import pako from 'pako';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getActualFluentTheme, getActualTheme, setTheme } from '../utils/theme';

import './Home.css';

let fileHandle: any;
let isAnyChangePending = false;
let isFileJustOpened = false;

const baseUrl = window.location.origin;

export const Home: React.FunctionComponent = () => {
  const [editorValue, setEditorValue] = useState<string>('');
  const [editorLanguage, setEditorLanguage] = useState<string>('plaintext');
  const [editorLanguages, setEditorLanguages] = useState<languages.ILanguageExtensionPoint[]>();
  const [editorTheme, setEditorTheme] = useState<string>(getActualTheme() === 'light' ? 'vs-light' : 'vs-dark');
  const [dialogConfig, setDialogConfig] = useState<{
    dialogProps?: IDialogContentProps,
    modalProps?: IModalProps,
    buttons?: { text: string, handler?: React.MouseEventHandler<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement | BaseButton | Button | HTMLSpanElement>, type: any }[]
  }>();

  const { editorLanguage: _editorLanguage, sharedContentBase64 } = useParams<any>();

  useEffect(() => {
    window.addEventListener('beforeunload', (event: any) => {
      if (isAnyChangePending) {
        const message = 'You have unsaved changes, are you really sure to close the document?';
        event.returnValue = message;
      }
    });

    if (sharedContentBase64) {
      const encodedBuffer = base64ToBuffer(sharedContentBase64.replace(/-/g, '/'));
      const inflatedBuffer = pako.inflate(encodedBuffer);
      setEditorLanguage(_editorLanguage);
      setEditorValue(new TextDecoder('utf8').decode(inflatedBuffer));
    }

    if ('launchQueue' in window) {
      (window as any)['launchQueue'].setConsumer((launchParams: any) => {
        if (launchParams.files?.length > 0) {
          for (const fileHandle of launchParams.files) {
            openFile(fileHandle);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
              secondaryText: 'Ctrl + N',
              iconProps: { iconName: 'Document' },
              onClick: () => createNew(),
            },
            {
              key: 'open',
              text: 'Open',
              secondaryText: 'Ctrl + O',
              iconProps: { iconName: 'OpenFile' },
              onClick: () => openFile(),
            },
            {
              key: 'save',
              text: 'Save',
              secondaryText: 'Ctrl + S',
              iconProps: { iconName: 'Save' },
              onClick: () => saveFile(),
            },
            {
              key: 'saveAs',
              text: 'Save As',
              secondaryText: 'Ctrl + Shift + S',
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
        subMenuProps: {
          items: [
            {
              key: 'theme',
              text: 'Theme',
              iconProps: { iconName: getActualTheme() === 'light' ? 'Sunny' : 'ClearNight' },
              subMenuProps: {
                items: [
                  {
                    key: 'light',
                    text: 'Light',
                    onClick: () => {
                      setTheme('light');
                      setEditorTheme('vs-light');
                    },
                  },
                  {
                    key: 'dark',
                    text: 'Dark',
                    onClick: () => {
                      setTheme('dark');
                      setEditorTheme('vs-dark');
                    },
                  },
                  {
                    key: 'system',
                    text: 'System Default',
                    onClick: () => {
                      setTheme('system');
                      setEditorTheme(`vs-${getActualTheme()}`);
                    },
                  },
                ]
              }
            },
          ]
        }
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
              onClick: () => shareSnapshot(),
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

  async function shareSnapshot() {
    const deflatedText = pako.deflate(new TextEncoder().encode(editorValue));
    const base64String = bufferToBase64(deflatedText).replace(/\//g, '-');
    const url = `${baseUrl}/snapshot/${editorLanguage || 'plaintext'}/${base64String}`;
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: document.title,
        url
      });
    } else {
      prompt('You can copy the link and share it.', url);
    }
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
      setDialogConfig({
        dialogProps: {
          type: DialogType.normal,
          title: 'You have unsaved changes',
          subText: 'Do you really want to close current document without saving the changes?',
        },
        modalProps: { isBlocking: true },
        buttons: [
          {
            type: PrimaryButton,
            text: 'Yes',
            handler: () => {
              continueHandler();
              setDialogConfig(undefined);
            },
          },
          {
            type: DefaultButton,
            text: 'No',
            handler: () => {
              cancelHandler?.();
              setDialogConfig(undefined);
            },
          },
        ]
      });
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
        {
          dialogConfig &&
          <Dialog
            hidden={false}
            onDismiss={() => setDialogConfig(undefined)}
            dialogContentProps={dialogConfig?.dialogProps}
            modalProps={dialogConfig?.modalProps}
          >
            <DialogFooter>
              {
                dialogConfig.buttons?.map(button => (
                  <button.type key={button.text} text={button.text} onClick={button.handler}></button.type>
                ))
              }
            </DialogFooter>
          </Dialog>
        }
        <CommandBar
          id="command-bar"
          items={getCommandBarItems()}
          farItems={getCommandBarFarItems({ editorLanguage, editorLanguages, setEditorLanguage })}
          ariaLabel="Use left and right arrow keys to navigate between commands"
        />
        <s-monaco-editor
          id="editor"
          monaco-vs-path="/monaco-editor/vs"
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
          onDragOver={(event: any) => event.preventDefault()}
          onDrop={async (event: any) => {
            event.preventDefault();
            for (const item of (event.dataTransfer.items as any)) {
              if (item.kind === 'file') {
                const fileHandle = await item.getAsFileSystemHandle();
                if (fileHandle.kind === 'file') {
                  await openFile(fileHandle);
                } else {
                  setDialogConfig({
                    dialogProps: {
                      type: DialogType.normal,
                      title: 'Unsupported Type',
                      subText: 'Opening a direcotory is not supported.',
                    },
                    modalProps: { isBlocking: true },
                    buttons: [
                      {
                        type: PrimaryButton,
                        text: 'OK',
                        handler: () => {
                          setDialogConfig(undefined);
                        },
                      },
                    ]
                  });
                }
              }
            }
          }}
        ></s-monaco-editor>
      </ThemeProvider>
    </div>
  );
};

function bufferToBase64(buffer: Uint8Array) {
  var binstr = Array.prototype.map.call(buffer, function (character) {
    return String.fromCharCode(character);
  }).join('');
  return btoa(binstr);
}

function base64ToBuffer(base64: string) {
  var binstr = atob(base64);
  var buffer = new Uint8Array(binstr.length);
  Array.prototype.forEach.call(binstr, function (character, i) {
    buffer[i] = character.charCodeAt(0);
  });
  return buffer;
}
