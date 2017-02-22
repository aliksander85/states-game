angular
    .module('statesGame')
    .controller('HomeController', ['$state', '$uibModal', function ($state, $uibModal) {
        var vm = this;

        vm.openModal = function () {
            var modalInstance = $uibModal.open({
                templateUrl: '../partials/modal.html',
                controller: 'ModalCtrl',
                controllerAs: 'modal',
                size: 'md',
                resolve: {
                    content: function () {
                        return {
                            title: "Modal title",
                            body: "Modal body"
                        }
                    }
                }
            });

            modalInstance.result.then(function () {

            }, function () {

            });
        };

        vm.openModal();
    }]);