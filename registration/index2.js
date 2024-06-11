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



async function createUser(realmName, user) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${keycloakUrl}/admin/realms/${realmName}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user),
  });

  if (response.ok) {
    console.log(`Użytkownik "${user.username}" został utworzony w realmie "${realmName}".`);
    const locationHeader = response.headers.get('Location');
    const userId = locationHeader?.substring(locationHeader.lastIndexOf('/') + 1);
    return userId;
  } else {
    const errorData = await response.json();
    console.error('Błąd podczas tworzenia użytkownika:', errorData);
    throw new Error('Nie udało się utworzyć użytkownika');
  }
}

async function setPassword(realmName, userId, password) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${keycloakUrl}/admin/realms/${realmName}/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'password',
      value: password,
      temporary: false
    }),
  });

  if (response.ok) {
    console.log(`Hasło dla użytkownika "${userId}" zostało ustawione.`);
  } else {
    const errorData = await response.json();
    console.error('Błąd podczas ustawiania hasła:', errorData);
  }
}

// Przykład użycia
const newUser = {
  username: 'nowy.uzytkownik2',
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan.kowalski2@example.com',
  
  enabled: true,
};

async function main() {
  try {
    const userId = await createUser('nowy-realm', newUser);
    if (userId) {
      await setPassword('nowy-realm', userId, 'mojeBezpieczneHaslo');
    }
  } catch (error) {
    console.error('Błąd:', error);
  }
}

main();