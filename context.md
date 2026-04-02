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

# stores

dans Stores.tsx
faire comme dans le wireframe ci joint.
afficher la searchbar pour rechercher.

affichage des stores 
récupérées via :

### Get All Stores
GET {{api_url}}/stores
Authorization: Bearer {{token}}

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 757
ETag: W/"2f5-V41idsqyKCfFvISqZQ/7teu/jXw"
Date: Thu, 02 Apr 2026 09:32:47 GMT
Connection: close

[
  {
    "id": 5,
    "title": "Magasin Paris 15",
    "zoneId": null,
    "openingTime": "08:30",
    "closingTime": "19:00",
    "isOpenSunday": false,
    "minVolunteers": 2,
    "idealVolunteers": 5
  },
  {
    "id": 7,
    "title": "Magasin Paris 15",
    "zoneId": null,
    "openingTime": "08:30",
    "closingTime": "19:00",
    "isOpenSunday": false,
    "minVolunteers": 2,
    "idealVolunteers": 5
  },
  {
    "id": 4,
    "title": "Magasin Paris 15",
    "zoneId": 1,
    "openingTime": "08:30",
    "closingTime": "19:00",
    "isOpenSunday": false,
    "minVolunteers": 2,
    "idealVolunteers": 5
  },
  {
    "id": 6,
    "title": "Magasin Paris 15",
    "zoneId": 1,
    "openingTime": "08:30",
    "closingTime": "19:00",
    "isOpenSunday": false,
    "minVolunteers": 2,
    "idealVolunteers": 5
  },
  {
    "id": 8,
    "title": "Magasin Paris 15",
    "zoneId": 1,
    "openingTime": "08:30",
    "closingTime": "19:00",
    "isOpenSunday": false,
    "minVolunteers": 2,
    "idealVolunteers": 5
  }
]


n'afficher que le title


au clic sur le title 

rediriger vers Store.tsx

au clic sur Créer  rediriger vers CreateStore.tsx

