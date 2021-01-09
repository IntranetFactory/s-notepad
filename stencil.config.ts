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
        src: '../node_modules/@vanillawc/wc-monaco-editor/index.min.js',
        dest: 'build/wc-monaco-editor/index.min.js'
      },
      {
        src: '../node_modules/@vanillawc/wc-monaco-editor/monaco/workers',
        dest: 'build/wc-monaco-editor/monaco/workers'
      }
    ]
  }],
};
