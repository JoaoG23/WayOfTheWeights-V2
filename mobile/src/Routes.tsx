import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  NavigationContainer,
  NavigatorScreenParams,
  Theme,
} from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { useAuth } from "./contexts/AuthContext";
import { AppHeader } from "./components/AppHeader";
import { Carregando } from "./components/Feedback";
import { Login } from "./screens/Auth/Login";
import { SignUp } from "./screens/Auth/SignUp";
import { Home } from "./screens/Home";
import {
  Trainings,
  TrainingDetail,
  AddTraining,
  EditTraining,
  RemoveTraining,
} from "./screens/Trainings";
import {
  Exercises,
  AddExercise,
  ExerciseDetail,
  RemoveExercise,
} from "./screens/Exercises";
import { Weights } from "./screens/Weights";
import { Account } from "./screens/Account";
import { ChangePassword } from "./screens/Account/ChangePassword";
import { Users, AddUser, RemoveUser } from "./screens/Users";
import { cores } from "./theme/cores";

export type TTabDefinition = {
  Home: undefined;
  Treinos: undefined;
  Exercicios: undefined;
  Pesos: undefined;
};

export type TScreenDefinition = {
  Login: undefined;
  SignUp: undefined;
  Main: NavigatorScreenParams<TTabDefinition>;
  Account: undefined;
  ChangePassword: undefined;
  Users: undefined;
  AddUser: undefined;
  RemoveUser: { id: number; nome: string };
  TrainingDetail: { id: number; titulo: string };
  AddTraining: undefined;
  EditTraining: { id: number };
  RemoveTraining: { id: number; titulo: string };
  AddExercise: { treinoId: number };
  ExerciseDetail: { treinoId: number; id: number };
  RemoveExercise: { treinoId: number; id: number; nome: string };
};

const Tab = createBottomTabNavigator<TTabDefinition>();
const Stack = createNativeStackNavigator<TScreenDefinition>();

const TAB_ICONS: Record<
  keyof TTabDefinition,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  Home: "home",
  Treinos: "arm-flex",
  Exercicios: "weight-lifter",
  Pesos: "arrow-expand",
};

// Fundo escuro também nas transições entre telas (evita "piscar" branco).
const temaNavegacao: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: cores.destaque,
    background: cores.fundo,
    card: cores.fundo,
    text: cores.texto,
  },
};

const TabRoutes = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        header: () => <AppHeader />,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={TAB_ICONS[route.name]}
            size={size}
            color={color}
          />
        ),
        tabBarStyle: {
          backgroundColor: cores.destaque,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: cores.textoEscuro,
        tabBarInactiveTintColor: "rgba(50, 50, 64, 0.5)",
        tabBarLabelStyle: { fontWeight: "600" },
      })}
    >
      {/* Home não aparece na barra: é aberta pelo logo do header. */}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" },
        }}
      />
      <Tab.Screen name="Treinos" component={Trainings} />
      <Tab.Screen
        name="Exercicios"
        component={Exercises}
        options={{ title: "Exercícios" }}
      />
      <Tab.Screen name="Pesos" component={Weights} />
    </Tab.Navigator>
  );
};

export const AppRoutes = () => {
  const { usuario, carregandoSessao } = useAuth();

  // Fora do NavigationContainer não há tema, então o fundo escuro é explícito.
  if (carregandoSessao) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.fundo }}>
        <Carregando />
      </View>
    );
  }

  return (
    <NavigationContainer theme={temaNavegacao}>
      <Stack.Navigator
        screenOptions={{
          header: ({ navigation }) => (
            <AppHeader aoVoltar={navigation.goBack} />
          ),
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        {usuario ? (
          <>
            <Stack.Screen
              name="Main"
              component={TabRoutes}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Account" component={Account} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="Users" component={Users} />
            <Stack.Screen name="AddUser" component={AddUser} />
            <Stack.Screen name="RemoveUser" component={RemoveUser} />
            <Stack.Screen name="TrainingDetail" component={TrainingDetail} />
            <Stack.Screen name="AddTraining" component={AddTraining} />
            <Stack.Screen name="EditTraining" component={EditTraining} />
            <Stack.Screen name="RemoveTraining" component={RemoveTraining} />
            <Stack.Screen name="AddExercise" component={AddExercise} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetail} />
            <Stack.Screen name="RemoveExercise" component={RemoveExercise} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export type TNavigationScreenProps =
  NativeStackNavigationProp<TScreenDefinition>;
