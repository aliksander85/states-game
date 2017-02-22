angular
    .module('statesGame')
    .controller('HomeController', ['$state', function ($state) {
        var vm = this;
        vm.countries = ['Australia', 'Brazil', 'Canada', 'USA'];
        vm.selected = "";

        vm.startGame = function () {
            if (angular.isString(vm.selected) && vm.selected.length > 0) {
                $state.go('game', { id: vm.selected.toLowerCase() });
            }
        };
    }]);