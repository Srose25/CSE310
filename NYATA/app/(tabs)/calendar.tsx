import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/src/theme/tokens';
export default function Calendar() { return <View style={styles.page}><Text style={styles.kicker}>PLAN</Text><Text style={styles.title}>Calendar</Text><Text style={styles.empty}>Your agenda will appear here.</Text></View>; }
const styles = StyleSheet.create({ page: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: colors.background }, kicker: { color: colors.muted, letterSpacing: 2, fontSize: 12 }, title: { color: colors.text, fontFamily: typography.serif, fontSize: 36, marginTop: 12 }, empty: { color: colors.muted, marginTop: 40 } });

