angular
    .module('statesGame')
    .service('ModalService', ['$uibModal', function ($uibModal) {
        var vm = this;

        vm.openModal = function (content, cb) {
            var modalInstance = $uibModal.open({
                templateUrl: '../partials/modal.html',
                controller: 'ModalCtrl',
                controllerAs: 'modal',
                size: 'md',
                resolve: {
                    content: function () {
                        return {
                            title: content.title,
                            body: content.body
                        }
                    }
                }
            });

            modalInstance.result.then(function () {
                cb();
            });
        };

        return vm;
    }]);