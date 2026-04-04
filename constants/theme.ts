/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const accent = '#FF8216';

export const Colors = {
  accent,
  light: {
    text: '#212121',
    subtext: '#9E9E9E',
    secondaryText: '#AAA9AA',
    background: '#FFFFFF',
    card: '#F5F5F5',
    icon: '#9E9E9E',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: accent,
    border: '#E0E0E0',
  },
  dark: {
    text: '#FFFFFF',
    subtext: '#727374',
    secondaryText: '#4F5051',
    background: '#181A20',
    card: '#1E2122',
    icon: '#727374',
    tabIconDefault: '#4F5051',
    tabIconSelected: accent,
    border: '#2C2F30',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
