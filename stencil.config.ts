import { Config } from '@stencil/core';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalScript: 'src/global/app.ts',
  globalStyle: 'src/global/app.css',
  taskQueue: 'async',
  outputTargets: [{
    type: 'www',
    copy: [
      {
        src: '../node_modules/monaco-editor/min/vs/',
        dest: 'build/monaco-editor/vs/'
      }
    ]
  }],
};
