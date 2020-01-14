#### ZPR_Bomberman
Web application for Bomberman game - server using C++ and Python 3, web client using Angular 7

# 1. Frameworks / utilities
## Server
### Overseer
...
#### Development
* Python 3
* Flask

#### Dependencies
* Flask
* Flask-restplus
* Flask-JWT-Extended
* passlib

#### Tests
* [Swagger](https://swagger.io/)
* Standard Python unit tests

### Host manager & Game host
...
#### Development
* C++17
* QT 5.13.2

#### Tests

## Client
#### Development
* [Pug](https://pugjs.org)  
* [Sass](https://sass-lang.com/)
* [Socket.io](https://socket.io/)
* [webSocket from RxJS package](https://rxjs-dev.firebaseapp.com/api/webSocket)
* [Angular 7.2.0](https://angular.io/)   
* [Angular CLI 7.3.9](https://cli.angular.io/)  

#### Tests
* [Jasmine & Karma](https://jasmine.github.io/)

# 2. Starting project
- Frontend: In `client` directory execute `npm install` and next `npm start`. For testing -> execute `ng test` 
- Backend: In `overseer` directory type `python3 app.py`. Compiled executables of host manager and game host are required
