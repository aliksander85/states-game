angular
    .module('statesGame')
    .controller('ModalCtrl', ['$uibModalInstance', 'content', function ($uibModalInstance, content) {
        var vm = this;

        vm.content = content;

        vm.ok = function () {
            $uibModalInstance.close();
        };

    }]);