import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { services } from '../../../shared/data/services';
import { colors } from '../../../shared/theme/colors';

export default function ClientHome() {
  function showService(service) {
    Alert.alert(
      service.name,
      `${service.description}\n\nPreço ilustrativo: ${service.price} MT\nPontos após a lavagem: ${service.points}\n\nO agendamento será implementado na próxima etapa. Nenhuma reserva foi criada.`,
      [{ text: 'Entendido' }],
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
      <View>

        <Text style={styles.location}>CAR WASH · MATOLA</Text>
        <Text style={styles.title}>Lava Já</Text>
        <Text style={styles.intro}>Cuida do teu carro e ganha pontos a cada visita.</Text>

      </View>
      <View>

        <View style={styles.loyaltyCard}>
          <Text style={styles.loyaltyTitle}>Cada lavagem conta</Text>
          <Text style={styles.loyaltyText}>Acumula pontos após a lavagem concluída e troca-os por recompensas.</Text>
        </View>
        <Text style={styles.sectionTitle}>Escolhe a tua lavagem</Text>
        <Text style={styles.note}>Preços e pontos ilustrativos para demonstração.</Text>

        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.description}>{service.description}</Text>
            <View style={styles.details}>
              <Text style={styles.price}>{service.price} MT</Text>
              <Text style={styles.points}>+{service.points} pontos</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              accessibilityRole="button"
              accessibilityLabel={`Ver detalhes de ${service.name}`}
              onPress={() => showService(service)}
            >
              <Text style={styles.buttonText}>Ver detalhes</Text>
            </TouchableOpacity>
          </View>
        ))}

      </View>




      </ScrollView>
    </View>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, width: '100%', maxWidth: 600, alignSelf: 'center' },
  location: { color: colors.location, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 42, fontWeight: '800', marginVertical: 8 },
  intro: { color: colors.textSecondary, fontSize: 17, lineHeight: 26 },
  loyaltyCard: { backgroundColor: colors.text, borderRadius: 20, padding: 22, marginVertical: 24 },
  loyaltyTitle: { color: colors.onPrimary, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  loyaltyText: { color: colors.loyaltyText, fontSize: 15, lineHeight: 23 },
  sectionTitle: { color: colors.text, fontSize: 23, fontWeight: '700', marginBottom: 8 },
  note: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  serviceCard: { backgroundColor: colors.cardBackground, borderColor: colors.disabled, borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 16 },
  serviceName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  description: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 8 },
  details: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginVertical: 20 },
  price: { color: colors.text, fontSize: 26, fontWeight: '800' },
  points: { color: colors.secondary, backgroundColor: colors.inputBackground, padding: 8, borderRadius: 10, fontWeight: '600' },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 15, minHeight: 48, alignItems: 'center' },
  buttonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
});
