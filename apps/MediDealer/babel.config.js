module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-class-static-block',
    ['module:react-native-dotenv', {
      moduleName: '@react-native-dotenv',
      path: '.env',
      allowUndefined: true
    }]
  ],
};
