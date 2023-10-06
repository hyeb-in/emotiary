/*
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userNameSelector } from '../components/states/selectors/userSelector';

// 로그인 상태가 아닐 경우 intro 페이지 이동, 로그인 상태일 경우 true를 반환하는 hook
const useIsLogin = (): boolean => {
  const navigator = useNavigate();
  // userState에서 name을 가져옴
  const userName = useRecoilValue(userNameSelector);
  // localStorage에서 token을 가져옴
  const token = localStorage.getItem('userToken');

  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (!token || userName === '') {
      // token이 없거나, userName이 없는 경우(비 로그인상태) /intro로 이동
      if (['/intro', '/login', '/register'].includes(currentPath)) {
        return false;
      }
      navigator('/intro'); // 로그인 상태가 아님을 반환
      return false;
    }
  }, [navigator, token, userName, currentPath]);

  return true; // 로그인 상태임을 반환
};

export default useIsLogin;
*/