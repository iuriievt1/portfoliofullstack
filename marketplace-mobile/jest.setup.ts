import "@testing-library/jest-native/extend-expect";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name, ...props }: { name: string }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, props, name);
  }
}));

jest.mock("expo-image", () => ({
  Image: (props: object) => {
    const React = require("react");
    const { Image } = require("react-native");
    return React.createElement(Image, props);
  }
}));

jest.mock("expo-linking", () => ({
  openURL: jest.fn()
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: "expo-push-token" }))
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => null),
  deleteItemAsync: jest.fn(async () => null)
}));

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn()
}));

jest.mock("expo/virtual/env", () => ({
  env: process.env
}));

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: {
      View
    },
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: (updater: () => object) => updater(),
    withTiming: (value: unknown) => value
  };
});

jest.mock("react-native-svg", () => ({
  __esModule: true,
  default: (props: object) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, props);
  },
  Path: (props: object) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, props);
  }
}));
