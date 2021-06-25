import { CommandBar, ICommandBarItemProps, ThemeProvider } from '@fluentui/react';
import { languages } from 'monaco-editor';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { applyTheme, getActualFluentTheme, getActualTheme } from '../utils/theme';

import './Home.css';

export const Home: React.FunctionComponent = () => {
  const [editorValue] = useState<string>();
  const [editorLanguage, setEditorLanguage] = useState<string>('plaintext');
  const [editorLanguages, setEditorLanguages] = useState<languages.ILanguageExtensionPoint[]>();
  const [editorTheme] = useState<string>(getActualTheme() === 'light' ? 'vs-light' : 'vs-dark');

  useEffect(() => {
    applyTheme(getActualTheme());
  }, []);

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
          },
          {
            key: 'open',
            text: 'Open',
            iconProps: { iconName: 'OpenFile' },
          },
          {
            key: 'save',
            text: 'Save',
            iconProps: { iconName: 'Save' },
          },
          {
            key: 'saveAs',
            text: 'Save As',
            iconProps: { iconName: 'SaveAs' },
          },
          {
            key: 'exit',
            text: 'Exit',
            iconProps: { iconName: 'Leave' },
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
