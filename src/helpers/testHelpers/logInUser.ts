import { loginInfo } from './populateDbUsers';

// @ts-ignore
const logInUser = async (req) => {
  const res = await req.post('/api/auth/login').type('form').send(loginInfo);

  return res;
};

export default logInUser;
