import React, { FormEvent, useState } from 'react';
import { usePutSigninData } from '../../../api/mutation/usePutSigininData';
import { QueryClient } from '@tanstack/react-query';
import GoogleLogin from 'react-google-login';
import styles from './index.module.scss';

interface InputFieldProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  boxStyle: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  boxStyle,
}) => (
  <div className={styles.formGroup}>
    <label htmlFor={id}></label>
    <div className={styles.inputGroup}>
      <i className={boxStyle}></i>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const Signin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const saveToLocalStorage = (data: UserData) => {
    localStorage.setItem('email', data.email);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('username', data.name);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userImg', data.uploadFile);
    localStorage.setItem('refreshToken', data.refreshToken);
  };

  const mutation = useMutation(
    async (userSigninInfos: { email: string; password: string }) => {
      const response = await instance.post('http://localhost:5001/users/login', userSigninInfos);
      return response.data;
    },
    {
      // 로그인 성공
      onSuccess: (data: any) => {
        console.log('로그인 성공', data.data);
        saveToLocalStorage(data.data);
        navigate('/');
      },
      // 로그인 실패
      onError: (error: any) => {
        console.log('로그인 실패', error);
      },
    },
  );

  const responseGoogle = (response: any) => {
    if (response?.tokenId) {
      console.log('로그인 성공', response);
    } else {
      console.log('로그인 실패', response);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const userSigninInfos = { email, password };
    signinMutation.mutate(userSigninInfos);
  };

<<<<<<< HEAD
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const InputField: React.FC<InputFieldProps> = ({
    id,
    name,
    type,
    placeholder,
    value,
    onChange,
    boxStyle,
  }) => (
    <div className={styles.formGroup}>
      <label htmlFor={id}></label>
      <div className={styles.inputGroup}>
        <i className={boxStyle}></i>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );

=======
>>>>>>> feature/front/sub
  return (
    <>
      <div className={styles.centerContainer}>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <InputField
            id="email"
            name="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            boxStyle={styles.box1}
          />
          <InputField
            id="password"
            name="password"
            type="password"
            placeholder="패스워드를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            boxStyle={styles.box2}
          />
          <button type="submit" className={styles.submitButton}>
            SIGN IN
          </button>
          <GoogleLogin
            clientId="594577452303-n7paj5690d9l35dg3sskk755prrmv389.apps.googleusercontent.com"
            buttonText="Sign in with Google"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
          />
        </form>
      </div>
    </>
  );
};

export default Signin;