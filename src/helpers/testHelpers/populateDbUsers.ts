export const loginInfo = {
  username: '0',
  password: 'abcABC123'
};

// @ts-ignore
const populateDbUsers = async (req) => {
  const userInfo = {
    username: '0',
    email: '0@test.com',
    password: 'abcABC123',
    firstName: 'test',
    lastName: 'testson',
    age: 10
  };

  for (let i = 0; i < 5; i++) {
    // eslint-disable-next-line no-await-in-loop
    await req.post('/api/auth/signup').type('form').send(userInfo);
    userInfo.username = (i + 1).toString();
    userInfo.email = `${(i + 1).toString()}@test.com`;
    userInfo.age += 10;
  }
};

export default populateDbUsers;
