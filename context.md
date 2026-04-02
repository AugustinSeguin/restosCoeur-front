# general context prompt

- application responsive first à destination des restos du coeur
- doit marcher aussi sur dekstop
- react avec vite
- seule la route Form et Login sont accessibles sans token d'auth
- définir les types dans le dossiers src/types. Ex avec user
- l'auth contexte est dans src/contexts/AuthContext
- utiliser les hooks useMemo et useEffect 
- utilser les composants maisons :  select list, checkbox, button et textInput présent dans components/generic
- utiliser les vars css :     --color-primary: #5b63e6;
    --color-secondary: #4aa8c9; définies dans index.css
- utiliser tailwind pour le css !!!

# collectes

quand je clique sur une collecte : 
          <h2 className="m-0 text-lg font-semibold text-[var(--color-text)] sm:text-2xl">
                {collection.title}
              </h2>
dans Collections.tsx

je veux être redirigé vers Collection.tsx

qui correspond à un formulaire d'édition

Visuellement il doit etre pareil que CreateCollection.tsx

sauf qu'il faut appeler l'api : 

### Get Collection by ID
GET {{api_url}}/collections/1
Authorization: Bearer {{token}}


avec comme réponses : 

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 481
ETag: W/"1e1-0Uh4Sx80Y7ArsIQuPazKxsnX5rw"
Date: Thu, 02 Apr 2026 08:10:05 GMT
Connection: close

{
  "id": 1,
  "title": "Collecte Mars 2026",
  "isActive": true,
  "formUrl": "https://forms.example.com/collecte1",
  "slots": [
    {
      "id": 1,
      "startAt": "2026-03-15T09:00:00.000Z",
      "endAt": "2026-03-15T12:00:00.000Z",
      "collectionId": 1
    },
    {
      "id": 2,
      "startAt": "2026-03-15T09:00:00.000Z",
      "endAt": "2026-03-15T12:00:00.000Z",
      "collectionId": 1
    },
    {
      "id": 3,
      "startAt": "2026-03-15T09:00:00.000Z",
      "endAt": "2026-03-15T12:00:00.000Z",
      "collectionId": 1
    }
  ],
  "zones": [
    {
      "collectionId": 1,
      "zoneId": 1,
      "zone": {
        "id": 1,
        "title": "Zone Nord"
      }
    }
  ]
}

il faut que les inputs est comme values les values de la réponses de l'api : 

GET {{api_url}}/collections/1
Authorization: Bearer {{token}}

je te redonne le wireframe de create. mais la c'est édition

