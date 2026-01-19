import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import { AuthProvider } from './contexts/auth';
import './app.scss';

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log('App launched - 寻源家谱小程序');
  });

  return <AuthProvider>{ children } </AuthProvider>;
}

export default App;
