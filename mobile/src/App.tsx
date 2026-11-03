import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";

import { AppRoutes } from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";
import { cores } from "./theme/cores";

const queryClient = new QueryClient();

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: cores.destaque }}
      text1Style={{ fontSize: 18, fontWeight: "bold" }}
      text2Style={{ fontSize: 16 }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: cores.perigo }}
      text1Style={{ fontSize: 18, fontWeight: "bold" }}
      text2Style={{ fontSize: 16 }}
      text2NumberOfLines={3}
    />
  ),
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          <AppRoutes />
          <Toast config={toastConfig} />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
