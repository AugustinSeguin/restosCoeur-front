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

# user

la route login c'est identifiant via email et mot de passe 

et niveau api :


POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3NTEzNzgxMywiZXhwIjoxNzc1MjI0MjEzfQ.gfopOUneJ8KonN0Jb6FFlWeHwX7W0w239ssIncoT15U",
  "user": {
    "id": 1,
    "lastName": "Admin",
    "firstName": "Super",
    "username": "adminsuper",
    "birthdate": "1985-09-30T00:00:00.000Z",
    "codePostal": "69003",
    "email": "admin@example.com",
    "isAdmin": true,
    "type": "permanent"
  }
}

il faut seter le token a ce moment là.
je veux que tu set en cache les donnees utilisateurs via le AuthContext
en cas de logout du remove tout ducache : token + data user.

ensuite dans la navbar je veux quand on clic sur : 
        <span className="text-base font-bold text-[var(--color-primary)]">
          Restos du Coeur
        </span>
on soit redigirer vers la route board

il me faut également un nouvel  item à côté de : 
        <span className="text-base font-bold text-[var(--color-primary)]">
          Restos du Coeur
        </span>


qui soit le nom + prenom du user

et que si on clic dessus on aille vers la route User.tsx

qui est un formulaire d'édition des données user.
on doit pouvoir éditer : 
lastname, firstname, codePostal, email

qui sont des champs InputText sauf codePostal.
Au clic que le bouton editer il faut appele r: 

PUT {{api_url}}/users/1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "lastName": "Dupont",
  "firstName": "Jean-Pierre",
  "birthdate": "1990-05-14",
  "codePostal": "75012",
  "email": "jean.dupont@example.com",
  "phoneNumber": "0612345678",
  "isActive": true,
  "isAdmin": true,
  "type": "occasional"
}








