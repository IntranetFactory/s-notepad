import { CommandBar, ICommandBarItemProps } from '@fluentui/react';
import React from 'react';

import './Home.css';

export const Home: React.FunctionComponent = () => {
  return (
    <div id="main-container">
      <CommandBar
        id="command-bar"
        items={items}
        farItems={farItems}
        ariaLabel="Use left and right arrow keys to navigate between commands"
      />
      <s-monaco-editor id="editor"></s-monaco-editor>
    </div>
  );
};

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
    text: 'Plain Text',
    onClick: () => alert('Tapped language'),
  },
];