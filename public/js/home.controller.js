angular
    .module('statesGame')
    .controller('HomeController', ['$state', '$timeout', function ($state, $timeout) {
        var vm = this;
        vm.countries = ['Australia', 'Brazil', 'Canada', 'USA'];
        vm.selected = "";

        var countrySelect = angular.element('#country-select');

        vm.startGame = function () {
            if (angular.isString(vm.selected) && vm.selected.length > 0) {
                $state.go('game', { id: vm.selected.toLowerCase() });
            } else {
                countrySelect.focus();
                countrySelect.addClass('shake');

                $timeout(function () {
                    countrySelect.removeClass('shake');
                }, 200);
            }
        };
    }]);