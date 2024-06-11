const keycloakUrl = 'http://localhost:8080'; // URL do Twojego serwera Keycloak
const realm = 'master'; // Nazwa realmu
const clientId = 'admin-cli'; // ID klienta
const username = 'admin'; // Nazwa użytkownika
const password = 'admin'; // Hasło użytkownika

async function getAccessToken() {
  const response = await fetch(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: clientId,
      username: username,
      password: password,
    }),
  });

  if (!response.ok) {
    throw new Error('Błąd podczas uzyskiwania tokena dostępu');
  }

  const data = await response.json();
  return data.access_token;
}

async function createRealm(realmName) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${keycloakUrl}/admin/realms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      realm: realmName,
      enabled: true,
    }),
  });

  if (response.ok) {
    console.log(`Realm "${realmName}" został utworzony.`);
  } else {
    const errorData = await response.json();
    console.error('Błąd podczas tworzenia realm:', errorData);
  }
}

// Przykład użycia
createRealm('nowy-realm');
