import axios from "axios";

// A sessão é o cookie httpOnly "jwt" gravado pelo backend no login. O
// networking nativo do React Native (Android e iOS) guarda esse cookie e o
// reenvia sozinho em toda requisição; o app nunca manipula o token.
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
});

export default api;
