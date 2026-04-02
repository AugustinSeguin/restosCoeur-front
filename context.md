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

quand je clique sur le bouton Créer de Collections.tsx je dois être rediriger vers CreateCollection.tsx
en PJ le wireframe.

utilie TextInput pour le choix du titre.
la checkbox pour active : par défaut cochée.
Zones : 
champs recherches avec select list : 
tu dois appeler l'api : 
GET {{api_url}}/zones
Authorization: Bearer {{token}}

reponse : HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 30
ETag: W/"1e-+befmEaHEkrGbRF9g48N82tQDWI"
Date: Thu, 02 Apr 2026 07:56:04 GMT
Connection: close

[
  {
    "id": 1,
    "title": "Zone Nord"
  }
]

la select list affiche que le title de la zone

et on selectionne l'id

pour les créneaux au clic sur le bouton créer un créneau : 
il faut un date time picker pour selectionner le jour puis l'heure
de début et un autre date time picker pour selectionner le jour puis l'heure de fin

au clic sur le bouton créer appeler dans l'ordre : 

POST {{api_url}}/collections
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "title": "Collecte Mars 2026",
  "isActive": true,
  "formUrl": "https://forms.example.com/collecte1"
}

si ca retourne 

HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 112
ETag: W/"70-DYSSGeoh41B1qfgH5otZa79kmBA"
Date: Thu, 02 Apr 2026 07:58:34 GMT
Connection: close

{
  "id": 2,
  "title": "Collecte Mars 2026",
  "isActive": true,
  "formUrl": "https://forms.example.com/collecte1",
  "users": []
}


récupérer l'id : 
puis appeler pour chaque créneaux ajouter :  cette route : 

@collectionId = 1

### Create Slot
POST {{api_url}}/slots
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "startAt": "2026-03-15T09:00:00Z",
  "endAt": "2026-03-15T12:00:00Z",
  "collectionId": {{collectionId}}
}

enfin, en cas de succès global de toutes ces actions (appels API) retourner à la page collections.tsx


