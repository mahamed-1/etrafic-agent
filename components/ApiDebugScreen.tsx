import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    TextInput,
} from 'react-native';
import { ApiTester } from '@/utils/apiTester';
import { API_CONFIG } from '@/constants/config';

export const ApiDebugScreen: React.FC = () => {
    const [testResults, setTestResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({
        identifier: 'agent',
        password: ''
    });

    const runConnectivityTest = async () => {
        setLoading(true);
        try {
            const result = await ApiTester.testConnectivity();
            setTestResults({ connectivity: result });
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors du test');
        } finally {
            setLoading(false);
        }
    };

    const runFullTest = async () => {
        setLoading(true);
        try {
            const result = await ApiTester.runFullTest();
            setTestResults(result.details);
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors des tests complets');
        } finally {
            setLoading(false);
        }
    };

    const testRealLogin = async () => {
        if (!credentials.identifier || !credentials.password) {
            Alert.alert('Erreur', 'Veuillez saisir les identifiants');
            return;
        }

        setLoading(true);
        try {
            const result = await ApiTester.testRealLogin(
                credentials.identifier,
                credentials.password
            );

            if (result.success) {
                Alert.alert('Succès', 'Connexion réussie!');
                setTestResults({ login: result });
            } else {
                Alert.alert('Échec', result.message);
                setTestResults({ login: result });
            }
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors du test de connexion');
        } finally {
            setLoading(false);
        }
    };

    const renderTestResult = (title: string, result: any) => {
        if (!result) return null;

        return (
            <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>{title}</Text>
                <Text style={[
                    styles.resultStatus,
                    { color: result.success ? '#4CAF50' : '#F44336' }
                ]}>
                    {result.success ? '✅ SUCCÈS' : '❌ ÉCHEC'}
                </Text>
                <Text style={styles.resultMessage}>{result.message}</Text>
                {result.details && (
                    <Text style={styles.resultDetails}>
                        {JSON.stringify(result.details, null, 2)}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🔧 Debug API</Text>

            <View style={styles.configSection}>
                <Text style={styles.sectionTitle}>Configuration</Text>
                <Text style={styles.configText}>URL API: {API_CONFIG.BASE_URL}</Text>
                <Text style={styles.configText}>Auth URL: {API_CONFIG.AUTH_URL}</Text>
                <Text style={styles.configText}>Timeout: {API_CONFIG.TIMEOUT}ms</Text>
            </View>

            <View style={styles.testSection}>
                <Text style={styles.sectionTitle}>Tests de connectivité</Text>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={runConnectivityTest}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Test de connectivité</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={runFullTest}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Tests complets</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.loginSection}>
                <Text style={styles.sectionTitle}>Test de connexion</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Identifiant"
                    value={credentials.identifier}
                    onChangeText={(text) => setCredentials(prev => ({ ...prev, identifier: text }))}
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    value={credentials.password}
                    onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={testRealLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Tester la connexion</Text>
                </TouchableOpacity>
            </View>

            {testResults && (
                <View style={styles.resultsSection}>
                    <Text style={styles.sectionTitle}>Résultats des tests</Text>

                    {testResults.connectivity && renderTestResult('Connectivité', testResults.connectivity)}
                    {testResults.auth && renderTestResult('Authentification', testResults.auth)}
                    {testResults.login && renderTestResult('Connexion réelle', testResults.login)}
                </View>
            )}

            {loading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Tests en cours...</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    configSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
    },
    testSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
    },
    loginSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
    },
    resultsSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    configText: {
        fontSize: 14,
        marginBottom: 5,
        color: '#666',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
        fontSize: 16,
    },
    resultContainer: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    resultStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    resultMessage: {
        fontSize: 14,
        marginBottom: 5,
        color: '#666',
    },
    resultDetails: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'monospace',
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 4,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
});

export default ApiDebugScreen;
