import { Redirect } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { useSession } from '../context/SessionContext';
import { Button, Header, Page, s } from '../../../shared/components/PrototypeUI';

export default function Login() {
  const { role, signIn } = useSession();
  if (role) return <Redirect href={role === 'admin' ? '/admin' : '/client'} />;
  return <Page><Header title={Platform.OS === 'web' ? 'Administração Lava Já' : 'Bem-vindo ao Lava Já'} />
    <Text style={s.body}>{Platform.OS === 'web' ? 'Pedidos, serviços e fidelização num só lugar.' : 'Cuida do teu carro e ganha pontos a cada visita.'}</Text>
    <View style={s.card}><Text style={s.heading}>Entrar na demonstração</Text>
      <Text style={s.body}>Não precisas de email nem palavra-passe para explorar esta demonstração.</Text>
      {Platform.OS === 'web' ? <Button onPress={() => signIn('admin')}>Entrar na administração web</Button> : <Button onPress={() => signIn('client')}>Entrar como cliente</Button>}
      <Text style={s.note}>{Platform.OS === 'web' ? 'Painel de administração · acesso de demonstração sem credenciais.' : 'A administração está disponível no navegador do computador.'}</Text>
    </View>
  </Page>;
}
