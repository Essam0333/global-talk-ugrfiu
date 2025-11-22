
import { Redirect } from 'expo-router';

export default function Index() {
  // Directly redirect to the home screen without authentication
  return <Redirect href="/(tabs)/(home)/" />;
}
