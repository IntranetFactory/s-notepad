import { createTheme } from "@fluentui/react";

const defaultTheme = 'system';

export function getTheme() {
  return (localStorage.getItem('theme') || defaultTheme) as 'light' | 'dark' | 'system';
}

export function getActualTheme() {
  const theme = getTheme();
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      return 'dark';
    } else {
      return 'light';
    }
  } else {
    return theme;
  }
}

export function setTheme(theme: 'light' | 'dark' | 'system') {
  localStorage.setItem('theme', theme);
  applyTheme(getActualTheme());
}

export function applyTheme(theme: 'light' | 'dark') {
  switch (theme) {
    case 'light':
      document.body.classList.toggle('dark', false);
      (document.body.style as any)['colorScheme'] = 'light';
      break;
    case 'dark':
      document.body.classList.toggle('dark', true);
      (document.body.style as any)['colorScheme'] = 'dark';
      break;
  }
}

export const fluentLightTheme = createTheme({
  palette: {
    themePrimary: '#0078d4',
    themeLighterAlt: '#eff6fc',
    themeLighter: '#deecf9',
    themeLight: '#c7e0f4',
    themeTertiary: '#71afe5',
    themeSecondary: '#2b88d8',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
    neutralLighterAlt: '#faf9f8',
    neutralLighter: '#f3f2f1',
    neutralLight: '#edebe9',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralQuaternary: '#d0d0d0',
    neutralTertiaryAlt: '#c8c6c4',
    neutralTertiary: '#a19f9d',
    neutralSecondary: '#605e5c',
    neutralPrimaryAlt: '#3b3a39',
    neutralPrimary: '#323130',
    neutralDark: '#201f1e',
    black: '#000000',
    white: '#ffffff',
  }
});

export const fluentDarkTheme = createTheme({
  palette: {
    themePrimary: '#39a7fa',
    themeLighterAlt: '#02070a',
    themeLighter: '#091b28',
    themeLight: '#11324b',
    themeTertiary: '#226496',
    themeSecondary: '#3393dc',
    themeDarkAlt: '#4daffa',
    themeDark: '#68bbfb',
    themeDarker: '#8fcdfc',
    neutralLighterAlt: '#3c3c3c',
    neutralLighter: '#444444',
    neutralLight: '#515151',
    neutralQuaternaryAlt: '#595959',
    neutralQuaternary: '#5f5f5f',
    neutralTertiaryAlt: '#7a7a7a',
    neutralTertiary: '#c8c8c8',
    neutralSecondary: '#d0d0d0',
    neutralPrimaryAlt: '#dadada',
    neutralPrimary: '#ffffff',
    neutralDark: '#f4f4f4',
    black: '#f8f8f8',
    white: '#333333',
  }
});

export function getActualFluentTheme() {
  const theme = getTheme();
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      return fluentDarkTheme;
    } else {
      return fluentLightTheme;
    }
  } else {
    return fluentLightTheme;
  }
}