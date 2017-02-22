angular
    .module('statesGame')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: '../partials/home.html',
                controller: 'HomeController',
                controllerAs: 'home'
            })
            .state('game', {
                url: '/game/:id',
                templateUrl: '../partials/game.html',
                controller: 'GameController',
                controllerAs: 'game'
            });

        $urlRouterProvider.otherwise('/');
    }]);