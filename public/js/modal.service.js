angular
    .module('statesGame')
    .service('ModalService', ['$uibModal', function ($uibModal) {
        var vm = this;

        vm.openModal = function (content, cb) {
            var modalInstance = $uibModal.open({
                templateUrl: 'public/partials/modal.html',
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
                // modal close
                cb();
            }, function () {
                // modal dismiss
                cb();
            });
        };

        return vm;
    }]);