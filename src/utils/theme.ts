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
}

export const fluentLightTheme =  createTheme({
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
    neutralLighterAlt: '#e9e9e9',
    neutralLighter: '#e5e5e5',
    neutralLight: '#dcdcdc',
    neutralQuaternaryAlt: '#cdcdcd',
    neutralQuaternary: '#c4c4c4',
    neutralTertiaryAlt: '#bcbcbc',
    neutralTertiary: '#595959',
    neutralSecondary: '#373737',
    neutralPrimaryAlt: '#2f2f2f',
    neutralPrimary: '#000000',
    neutralDark: '#151515',
    black: '#0b0b0b',
    white: '#f0f0f0',
  }
});

export const fluentDarkTheme = createTheme({
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
    neutralLighterAlt: '#0f0f0f',
    neutralLighter: '#0f0f0f',
    neutralLight: '#0e0e0e',
    neutralQuaternaryAlt: '#0d0d0d',
    neutralQuaternary: '#0c0c0c',
    neutralTertiaryAlt: '#0c0c0c',
    neutralTertiary: '#c8c8c8',
    neutralSecondary: '#d0d0d0',
    neutralPrimaryAlt: '#dadada',
    neutralPrimary: '#ffffff',
    neutralDark: '#f4f4f4',
    black: '#f8f8f8',
    white: '#0f0f0f',
  }
});

export function getActualFluentTheme() {
  const theme = getActualTheme();
  if (theme === 'dark') {
    return fluentDarkTheme;
  } else {
    return fluentLightTheme;
  }
}
