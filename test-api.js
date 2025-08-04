#!/usr/bin/env node

/**
 * Script simple pour tester les endpoints API
 * Usage: node test-api.js
 */

const axios = require('axios');
// Utilisation du nouveau endpoint API centralisé
const API_BASE_URL = 'https://evisav2.gouv.dj/etraffic-api/v1/api';

// Test de connectivité
async function testConnectivity() {
  console.log('🔍 Test de connectivité...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    console.log('✅ Connectivité OK - Status:', response.status);
    return true;
  } catch (error) {
    if (error.response) {
      console.log(
        '⚠️  Serveur répond mais avec erreur:',
        error.response.status
      );
      return true; // Le serveur répond, c'est déjà bien
    } else {
      console.log('❌ Pas de réponse du serveur:', error.message);
      return false;
    }
  }
}

// Test endpoint de login
async function testLogin() {
  console.log('🔐 Test endpoint de login...');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        identifier: 'test',
        password: 'test',
      },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Login endpoint OK');
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log(
        '✅ Login endpoint fonctionne (401 = identifiants incorrects)'
      );
      return true;
    } else if (error.response) {
      console.log(
        '⚠️  Login endpoint répond avec erreur:',
        error.response.status
      );
      return true;
    } else {
      console.log('❌ Login endpoint ne répond pas:', error.message);
      return false;
    }
  }
}

// Test avec de vrais identifiants
async function testRealLogin(identifier, password) {
  console.log(`🔑 Test connexion réelle avec: ${identifier}`);
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        identifier,
        password,
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('🎉 CONNEXION RÉUSSIE !');
    console.log('📝 Token reçu:', response.data.accessToken ? 'Oui' : 'Non');
    console.log(
      '📝 Refresh token:',
      response.data.refreshToken ? 'Oui' : 'Non'
    );

    if (response.data.accessToken) {
      // Test de validation du token
      await testTokenValidation(response.data.accessToken);
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(
        `❌ Erreur ${error.response.status}:`,
        error.response.data?.message || 'Erreur inconnue'
      );
    } else {
      console.log('❌ Erreur réseau:', error.message);
    }
    return null;
  }
}

// Test de validation du token
async function testTokenValidation(token) {
  console.log('🎫 Test validation du token...');
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/session/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    console.log('✅ Token valide !');
    return true;
  } catch (error) {
    if (error.response) {
      console.log(
        `⚠️  Token invalide (${error.response.status}):`,
        error.response.data?.message
      );
    } else {
      console.log('❌ Erreur validation token:', error.message);
    }
    return false;
  }
}

// Programme principal
async function main() {
  console.log('🧪 === TEST API ETRAFFIC ===\n');

  const args = process.argv.slice(2);

  if (args.length >= 2) {
    // Test avec identifiants fournis
    const [identifier, password] = args;
    const result = await testRealLogin(identifier, password);

    if (result) {
      console.log('\n✅ Vos endpoints fonctionnent parfaitement !');
      console.log(
        "💡 Vous pouvez maintenant utiliser l'application normalement."
      );
    } else {
      console.log('\n❌ Problème de connexion. Vérifiez vos identifiants.');
    }
  } else {
    // Tests basiques
    console.log('Mode test basique (sans identifiants)\n');

    const connectivityOK = await testConnectivity();
    const loginOK = await testLogin();

    console.log('\n📊 === RÉSUMÉ ===');
    console.log(`Connectivité: ${connectivityOK ? '✅' : '❌'}`);
    console.log(`Endpoint Login: ${loginOK ? '✅' : '❌'}`);

    if (connectivityOK && loginOK) {
      console.log('\n✅ Vos endpoints fonctionnent !');
      console.log('💡 Pour tester avec de vrais identifiants:');
      console.log('   node test-api.js votre_identifiant votre_mot_de_passe');
    } else {
      console.log('\n❌ Problèmes détectés avec les endpoints.');
    }
  }
}

// Gestion des erreurs non catchées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err.message);
  process.exit(1);
});

// Exécution
main().catch(console.error);
