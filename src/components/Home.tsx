import { CommandBar, ICommandBarItemProps, setLanguage } from '@fluentui/react';
import { editor, languages } from 'monaco-editor';
import React from 'react';
import { useState } from 'react';

import './Home.css';

export const Home: React.FunctionComponent = () => {
  const [editorValue] = useState<string>();
  const [editorLanguage, setEditorLanguage] = useState<string>('plaintext');
  const [editorLanguages, setEditorLanguages] = useState<languages.ILanguageExtensionPoint[]>();

  const items: ICommandBarItemProps[] = [
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
  ];

  const farItems: ICommandBarItemProps[] = [
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
  ];

  return (
    <div id="main-container">
      <CommandBar
        id="command-bar"
        items={items}
        farItems={farItems}
        ariaLabel="Use left and right arrow keys to navigate between commands"
      />
      <s-monaco-editor
        id="editor"
        value={editorValue}
        language={editorLanguage}
        ref={el => {
          el?.addEventListener('componentLoad', event => {
            const detail = (event as CustomEvent).detail;
            setEditorLanguages(detail.monaco.languages.getLanguages());
          })
        }}
      ></s-monaco-editor>
    </div>
  );
};
