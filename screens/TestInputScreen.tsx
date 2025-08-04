// app/(auth)/test-input.tsx (si tu utilises expo-router)
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Button,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

export default function TestInputScreen() {
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const [isBadgeFocused, setIsBadgeFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Ferme le clavier si on touche en dehors */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Écran de Test</Text>

            <Text style={styles.label}>Badge</Text>
            <TextInput
              style={[
                styles.input,
                isBadgeFocused && { borderColor: '#007bff' },
              ]}
              value={badge}
              onChangeText={setBadge}
              placeholder="Entrez votre badge"
              onFocus={() => {
                setIsBadgeFocused(true);
                console.log('Focus badge');
              }}
              onBlur={() => {
                setIsBadgeFocused(false);
                console.log('Blur badge');
              }}
            />

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={[
                styles.input,
                isPasswordFocused && { borderColor: '#007bff' },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              secureTextEntry
              onFocus={() => {
                setIsPasswordFocused(true);
                console.log('Focus password');
              }}
              onBlur={() => {
                setIsPasswordFocused(false);
                console.log('Blur password');
              }}
            />

            <View style={styles.buttonWrapper}>
              <Button
                title="Submit"
                onPress={() => {
                  console.log('Badge:', badge);
                  console.log('Password:', password);
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonWrapper: {
    marginTop: 30,
  },
});
