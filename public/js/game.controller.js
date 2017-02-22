angular
    .module('statesGame')
    .controller('GameController', ['$stateParams', 'MapService', '$state', '$rootScope', 'ModalService', function ($stateParams, MapService, $state, $rootScope, ModalService) {
        var vm = this;

        if (angular.isString($stateParams.id) && $stateParams.id.length > 0) {
            MapService.initialize($stateParams.id);
        } else {
            $state.go('home');
        }

        var finishedGameListener = $rootScope.$on('finishedGame', function (e, result) {
            ModalService.openModal({ title: 'Finished game', body: result }, function () {
                $state.go('home');
            });
        });

        $rootScope.$on('$destroy', function () {
            finishedGameListener();
        });
    }]);