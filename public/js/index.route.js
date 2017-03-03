angular
    .module('statesGame')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'public/partials/home.html',
                controller: 'HomeController',
                controllerAs: 'home'
            })
            .state('game', {
                url: '/game/:id',
                templateUrl: 'public/partials/game.html',
                controller: 'GameController',
                controllerAs: 'game'
            });

        $urlRouterProvider.otherwise('/');
    }]);