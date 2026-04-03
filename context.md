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

# board

dans boards.tsx 
il faut une page comme dans Collections.tsx avec la searchBar et la liste des collections.

Donc appeler l'API : 
GET {{api_url}}/collections
Authorization: Bearer {{token}}

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 103
ETag: W/"67-Ue3nbpo20HT2HHs0z8R4EmUQOd8"
Date: Fri, 03 Apr 2026 08:42:27 GMT
Connection: close

[
  {
    "id": 1,
    "title": "Collecte Mars 2026",
    "isActive": true,
    "formUrl": "https://forms.example.com/collecte1"
  }
]

faire comme dans Collections.tsx où on liste les collection et au clic sur le title d'une collection rediriger vers Board.tsx

quand on charge Board.tsx =>

ci joint le wireframe du board.tsx

pour une collection, faut afficher un tableau contenant :
- 1 ligne = 1 user de la collection
- 1 colonne = 1 créneau (slot).

pour chaque ligne si un user a repondu pour ce créneau alors mettre des border couleur verte (
    --color-green: #3e9e43;)
    et afficher dans cette cellule la select des stores de ce slot
sinon 
border couleur rouge : 
  (--color-red: #c95b5b;)
et pas de select list.


toutes les données nécessaires sont appelés via API:

appel API : 
GET {{api_url}}/collectionsBoard/1
Authorization: Bearer {{token}}


HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 1706
ETag: W/"6aa-k48mVD8Z47wzvvj4emuOy/HG3uM"
Date: Fri, 03 Apr 2026 08:55:45 GMT
Connection: close

{
  "id": 1,
  "title": "Collecte Mars 2026",
  "isActive": true,
  "formUrl": "https://forms.example.com/collecte1",
  "users": [
    {
      "id": 1,
      "lastName": "Dupont",
      "firstName": "Jean-Pierre",
      "username": "dupontjeanpierre",
      "birthdate": "1990-05-14T00:00:00.000Z",
      "codePostal": "75012",
      "email": "admin@example.com",
      "phoneNumber": "0612345678",
      "password": "$2b$10$h8OWLBIiszb22WeV.soEOO1mfmjWtb7RN8gvzEQTFaUJR5HvRWwne",
      "isActive": true,
      "isAdmin": true,
      "type": "occasional",
      "assignments": [
        {
          "userId": 1,
          "slotId": 1,
          "storeId": 8,
          "collectionId": 1,
          "slot": {
            "id": 1,
            "startAt": "2026-03-15T09:00:00.000Z",
            "endAt": "2026-03-15T12:00:00.000Z",
            "collectionId": 1
          },
          "store": {
            "id": 8,
            "title": "Magasin Paris 15",
            "zoneId": 1,
            "openingTime": "08:30",
            "closingTime": "19:00",
            "isOpenSunday": false,
            "minVolunteers": 2,
            "idealVolunteers": 5
          }
        }
      ],
      "userAnswers": []
    },
    {
      "id": 8,
      "lastName": "Martin",
      "firstName": "Alice",
      "username": "martinalice",
      "birthdate": "1998-04-22T00:00:00.000Z",
      "codePostal": "33000",
      "email": "alice.martin@example.com",
      "phoneNumber": "0612345678",
      "password": null,
      "isActive": true,
      "isAdmin": false,
      "type": "newcomer",
      "assignments": [],
      "userAnswers": [
        {
          "id": 1,
          "userId": 8,
          "collectionId": 1,
          "slotId": 1,
          "zoneId": 1,
          "createdAt": "2026-04-03T08:39:55.667Z",
          "updatedAt": "2026-04-03T08:39:55.667Z"
        },
        {
          "id": 2,
          "userId": 8,
          "collectionId": 1,
          "slotId": 2,
          "zoneId": 1,
          "createdAt": "2026-04-03T08:39:55.667Z",
          "updatedAt": "2026-04-03T08:39:55.667Z"
        }
      ]
    }
  ],
  "slots": [
    {
      "id": 1,
      "startAt": "2026-03-15T09:00:00.000Z",
      "endAt": "2026-03-15T12:00:00.000Z",
      "collectionId": 1,
      "openStores": []
    },
    {
      "id": 2,
      "startAt": "2026-03-15T09:00:00.000Z",
      "endAt": "2026-03-15T12:00:00.000Z",
      "collectionId": 1,
      "openStores": []
    },
    {
      "id": 3,
      "startAt": "2026-03-15T09:00:00.000Z",
      "endAt": "2026-03-15T12:00:00.000Z",
      "collectionId": 1,
      "openStores": []
    }
  ]
}


la derniere colonne est un bouton "enregistrer"

en bas du tableau rajouter un bouton : "Envoyer les notifications" couleur primary :(  --color-primary: #646cff;
)

pour l'instant il fait juste un console Log 


quand on clic sur un ligne enregistrer donc une ligne d'un user : 

appeler : 

POST {{api_url}}/assignments
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "userId": {{userId}},
  "slotId": {{slotId}},
  "storeId": {{storeId}},
  "collectionId": {{collectionId}}
}


ou 

PUT {{api_url}}/assignments/{{collectionId}}/{{userId}}/{{slotId}}/{{storeId}}
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "newUserId": 2,
  "newSlotId": 2,
  "newStoreId": 2,
  "newCollectionId": 1
}

en fonction si on a déjà affectation (assignemnt)

créer le type assignemnt

