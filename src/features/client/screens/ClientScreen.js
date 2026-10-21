import { View } from 'react-native';
import ClientHome from '../components/ClientHome';
import { useSession } from '../../auth/context/SessionContext';
import { Button } from '../../../shared/components/PrototypeUI';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Client() {
  const { signOut } = useSession();
  const insets = useSafeAreaInsets();
  return <View style={{ flex: 1 }}><ClientHome /><View style={{ padding: 16, paddingBottom: insets.bottom + 16 }}><Button secondary onPress={signOut}>Sair da conta</Button></View></View>;
}
