![plot](https://github.com/bibimchi/ODK/blob/master/src/asset/favicon.png)

## ODK - mole catching game
24 holes in the play area are filled with small moles, which pop up at random. Points are scored by whacking each mole as it appears.

## Links
* [DEMO](https://kimchistudio.tech/ODK)
* [DOCKER IMAGE](https://hub.docker.com/repository/docker/kimchiboy/odk)

## Implementation
The mole catching game is implemented with PREACT and Typescript.
The solution is composed of a set of common components 
* button, 
* layout 
* icon
These components are located in /src/components/common.

The "Homescreen" component is the entry point of the application, its purpose is to display the page using common components. The class is strongly coupled with the "Homehook" class that handles all the logic of the page.

I didn't implement any test for this solution.

## Development Recipe
* clone repository
* npm install
* npm run start
* open browser to http://localhost:8080

## Docker Recipe
* clone repository
* npm install
* npm build:local
* docker build -t image_name .
* docker run --detach --publish 8282:8282 --name container_name image_name
* open browser to http://localhost:8282

