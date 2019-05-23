// generate 16 char client nonce
export const generateCnonce = () => {
  const characters = "abcdef0123456789";
  let token = "";
  for (let i = 0; i < 16; i++) {
    const randNum = Math.round(Math.random() * characters.length);
    token += characters.substr(randNum, 1);
  }
  return token;
};
