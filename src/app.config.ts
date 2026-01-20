export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/family/index',
    'pages/mine/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1a1a2e',
    navigationBarTitleText: '寻源族谱',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#c9a050',
    backgroundColor: '#1a1a2e',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '家族',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
});
