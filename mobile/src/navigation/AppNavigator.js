import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { colors } from '../utils/theme'

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'

// Main screens
import HomeScreen from '../screens/HomeScreen'
import CommunitiesScreen from '../screens/communities/CommunitiesScreen'
import CommunityDetailScreen from '../screens/communities/CommunityDetailScreen'
import ServicesScreen from '../screens/services/ServicesScreen'
import ServiceDetailScreen from '../screens/services/ServiceDetailScreen'
import ServiceCreateScreen from '../screens/services/ServiceCreateScreen'
import CompaniesScreen from '../screens/companies/CompaniesScreen'
import CompanyDetailScreen from '../screens/companies/CompanyDetailScreen'
import CompanyCreateScreen from '../screens/companies/CompanyCreateScreen'
import FavoritesScreen from '../screens/favorites/FavoritesScreen'
import MessagesScreen from '../screens/messages/MessagesScreen'
import ChatScreen from '../screens/messages/ChatScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const tabIcons = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Communities: { focused: 'people', unfocused: 'people-outline' },
  Services: { focused: 'briefcase', unfocused: 'briefcase-outline' },
  Favorites: { focused: 'heart', unfocused: 'heart-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingBottom: 8, paddingTop: 8, height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = tabIcons[route.name]
          return <Ionicons name={focused ? icons.focused : icons.unfocused} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Communities" component={CommunitiesScreen} options={{ title: 'Comunidades' }} />
      <Tab.Screen name="Services" component={ServicesScreen} options={{ title: 'Serviços' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} options={{ title: 'Comunidade' }} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Serviço' }} />
      <Stack.Screen name="ServiceCreate" component={ServiceCreateScreen} options={{ title: 'Cadastrar Serviço' }} />
      <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} options={{ title: 'Empresa' }} />
      <Stack.Screen name="CompanyCreate" component={CompanyCreateScreen} options={{ title: 'Cadastrar Empresa' }} />
      <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: 'Mensagens' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Painel Admin' }} />
    </Stack.Navigator>
  )
}

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
