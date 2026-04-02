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

# zones

dans Zones.tsx au clic sur :
          <h2 className="m-0 text-lg font-semibold text-[var(--color-text)] sm:text-2xl">
                {zone.title}
              </h2>
              redirigé sur Zone.tsx
               via l'id.

appeler l'api comme suit : 

GET {{api_url}}/zones/1
Authorization: Bearer {{token}}

response : 

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 200
ETag: W/"c8-hb3P92taZIBoFNT0cScIK0qIIZc"
Date: Thu, 02 Apr 2026 09:05:27 GMT
Connection: close

{
  "id": 1,
  "title": "Zone Nord",
  "stores": [],
  "collections": [
    {
      "collectionId": 1,
      "zoneId": 1,
      "collection": {
        "id": 1,
        "title": "aaaaaaaaa",
        "isActive": true,
        "formUrl": "https://forms.example.com/collecte1-updated"
      }
    }
  ]
}

Zone.tsx est un form d'édition comme ca a été fait dans Collection.tsx.
inspire en toi visuellement.

je dois pouvoir supprimer tes associations store - zone

au clic sur le bouton éditer ca doit appeler : 

### Update Zone
PUT {{api_url}}/zones/1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "title": "Zone Nord Updated",
  "storeIds": [2, 4, 5]
}

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 356
ETag: W/"164-sc/KQ7uSL8/9r4ZYCseAkAlKQPw"
Date: Thu, 02 Apr 2026 09:07:35 GMT
Connection: close

{
  "id": 1,
  "title": "Zone Nord Updated",
  "stores": [
    {
      "id": 2,
      "title": "Magasin Paris 15",
      "zoneId": 1,
      "openingTime": "08:30",
      "closingTime": "19:00",
      "isOpenSunday": true,
      "minVolunteers": 2,
      "idealVolunteers": 5
    }
  ],
  "collections": [
    {
      "collectionId": 1,
      "zoneId": 1,
      "collection": {
        "id": 1,
        "title": "aaaaaaaaa",
        "isActive": true,
        "formUrl": "https://forms.example.com/collecte1-updated"
      }
    }
  ]
}
