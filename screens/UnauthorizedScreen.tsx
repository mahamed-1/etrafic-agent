import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export const UnauthorizedScreen: React.FC = () => {
    const { logout } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Accès non autorisé</Text>
            <Text style={styles.message}>
                Vous devez être un agent enregistré pour accéder à cette application.
            </Text>
            <Button
                title="Se déconnecter"
                onPress={logout}
                color="#E53935"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#D32F2F'
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#555'
    }
});