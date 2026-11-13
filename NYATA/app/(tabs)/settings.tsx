import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/src/theme/tokens';
export default function Settings() { return <View style={styles.page}><Text style={styles.kicker}>PREFERENCES</Text><Text style={styles.title}>Settings</Text><Text style={styles.body}>NYATA is offline-first. Your goals and progress stay on this device. Version 0 does not use accounts, analytics, or cloud sync.</Text></View>; }
const styles = StyleSheet.create({ page: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: colors.background }, kicker: { color: colors.muted, letterSpacing: 2, fontSize: 12 }, title: { color: colors.text, fontFamily: typography.serif, fontSize: 36, marginTop: 12 }, body: { color: colors.muted, marginTop: 40, lineHeight: 24, fontSize: 16 } });

