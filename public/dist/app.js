angular.module('statesGame', ['ui.router', 'ngAnimate', 'ngSanitize', 'ui.bootstrap']);
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
angular
    .module('statesGame')
    .controller('GameController', ['$stateParams', 'MapService', '$state', '$rootScope', 'ModalService', '$scope', function ($stateParams, MapService, $state, $rootScope, ModalService, $scope) {
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

        $scope.$on('$destroy', function() {
            finishedGameListener();
        });
    }]);
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
angular
    .module('statesGame')
    .service('MapService', ['Questionnaire', '$rootScope', '$timeout', '$state', function (Questionnaire, $rootScope, $timeout, $state) {
        var self = this;

        self.initialize = initialize;
        self.showTooltip = showTooltip;
        self.hideTooltip = hideTooltip;

        var width = 960
            , height = 800
            , svg
            , tooltip
            , countries;

        var projectionCanada = d3.geoAzimuthalEquidistant()
            .scale(900)
            .rotate([110, -60])
            .clipAngle(180 - 1e-3)
            .translate([350, 450])
            .precision(.1);

        var projectionUSA = d3.geoAlbersUsa()
            .scale(1000)
            .translate([width / 2, height / 2]);

        var projectionBrazil = d3.geoAzimuthalEquidistant()
            .scale(900)
            .rotate([50, 30])
            .clipAngle(180 - 1e-3)
            .translate([500, 600])
            .precision(.1);

        var projectionAustralia = d3.geoAzimuthalEquidistant()
            .scale(900)
            .rotate([-135, 60])
            .clipAngle(180 - 1e-3)
            .translate([500, 900])
            .precision(.1);

        function initialize(selectedCountry) {

            svg = d3.select("#svg-container").append("svg")
                .attr('class', 'map')
                .attr("width", width)
                .attr("height", height);

            countries = ['Australia', 'Brazil', 'Canada', 'United States of America'];

            switch (selectedCountry) {
                case "australia":
                    chooseCountry(0);
                    break;
                case "brazil":
                    chooseCountry(1);
                    break;
                case "canada":
                    chooseCountry(2);
                    break;
                case "usa":
                    chooseCountry(3);
                    break;
                default:
                    $state.go('home');
                    break;
            }
        }

        function chooseProjection(chosenCountry) {
            if (chosenCountry == 'Australia') {
                return projectionAustralia;
            } else if (chosenCountry == 'Brazil') {
                return projectionBrazil;
            } else if (chosenCountry == 'Canada') {
                return projectionCanada;
            } else if (chosenCountry == 'United States of America') {
                return projectionUSA;
            } else {
                return projectionUSA;
            }
        }

        function drawMap(path, chosenCountry) {
            d3.json('../data/provincies.json', function (error, states) {
                if (error) {
                    return console.error(error);
                }

                var allRegions = states.objects.new_lakes.geometries.slice();

                Questionnaire.showQuestionnaire(allRegions, chosenCountry);

                svg.selectAll("*").remove();

                svg.selectAll(".subunit")
                    .data(topojson.feature(states, states.objects.new_lakes).features)
                    .enter().append("path")
                    .attr("class", function(d, i) {
                        var hiddenClass = d.properties.admin == chosenCountry ? '' : ' hidden';
                        return "subunit " + d.id + hiddenClass;
                    })
                    .attr('fill', '#ccc')
                    .attr('stroke', '#212121')
                    .on('mouseover', function() {
                        d3.select(this)
                            .attr("fill", '#777')
                            .style("transition", "fill .5s ease-in");
                    })
                    .on('mouseout', function() {
                        d3.select(this)
                            .attr("fill", '#ccc')
                            .style("transition", "fill .5s ease-out");
                    })
                    .on('click', function(d) {
                        Questionnaire.checkAnswer(d.properties.name, this, d3.event.pageX, d3.event.pageY);
                    })
                    .attr("d", path);

                tooltip = d3.select('body').append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

            });
        }

        function showTooltip(_x, _y, _name) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(_name)
                .style("left", (_x) + "px")
                .style("top", (_y - 28) + "px");
        }
        function hideTooltip() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }

        function chooseCountry(_index) {
            angular.element('#task').html('');

            var chosenCountry = countries[_index];
            var chosenProjection = chooseProjection(chosenCountry);
            var path = d3.geoPath().projection(chosenProjection);

            drawMap(path, chosenCountry);
        }

        var showTooltipListener = $rootScope.$on('showTooltip', function (e, data) {
            self.showTooltip(data._x, data._y, data._name);

            $timeout(function () {
                self.hideTooltip();
            }, 1500);
        });

        $rootScope.$on('$destroy', function () {
            showTooltipListener();
        });

        return self;
    }]);
angular
    .module('statesGame')
    .controller('ModalCtrl', ['$uibModalInstance', 'content', function ($uibModalInstance, content) {
        var vm = this;

        vm.content = content;

        vm.ok = function () {
            $uibModalInstance.close();
        };

    }]);
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
                // modal close
                cb();
            }, function () {
                // modal dismiss
                cb();
            });
        };

        return vm;
    }]);
angular
    .module('statesGame')
    .service('Questionnaire', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        var self = this
            , numberOfRegion = 0
            , attempts = {}
            , errors = 0;

        var regions = []
            , quantity
            , currentQuestion = '';

        self.showQuestionnaire = showQuestionnaire;
        self.checkAnswer = checkAnswer;

        /**
         * Shuffles array in place.
         * @param {Array} a items The array containing the items.
         */
        function shuffle(a) {
            var j, x, i;
            for (i = a.length; i; i--) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x;
            }
        }

        function showQuestionnaire(_regions, chosenCountry) {
            var countryRegions = [];
            for (var i = 0; i < _regions.length; i++) {
                if (_regions[i].properties.admin === chosenCountry) {
                    if (_regions[i].properties.name === 'Jervis Bay Territory') { continue; }
                    if (_regions[i].properties.name === 'District of Columbia') { continue; }

                    _regions[i].id = _regions[i].id.replace(/\./, '-');

                    countryRegions.push(_regions[i]);
                }
            }
            shuffle(countryRegions);
            regions = countryRegions.slice();
            quantity = regions.length;
            showQuestion();
        }

        function checkAnswer(_name, _regionEl, _x, _y) {
            if (numberOfRegion >= quantity) return;

            currentQuestion = regions[numberOfRegion].properties.name;

            if (_name === currentQuestion) {

                if (!attempts[currentQuestion]) {
                    attempts[currentQuestion] = 1;
                    d3.select(_regionEl).classed('true-region', false);
                    d3.select(_regionEl).classed('first-attempt', true);
                } else if (attempts[currentQuestion] == 1) {
                    attempts[currentQuestion] = 2;
                    d3.select(_regionEl).classed('true-region', false);
                    d3.select(_regionEl).classed('second-attempt', true);
                } else if (attempts[currentQuestion] == 2) {
                    attempts[currentQuestion] = 3;
                    d3.select(_regionEl).classed('true-region', false);
                    d3.select(_regionEl).classed('third-attempt', true);
                } else if (attempts[currentQuestion] >= 3) {
                    attempts[currentQuestion] = 4;
                    d3.select(_regionEl).classed('true-region', false);
                    d3.select(_regionEl).classed('fourth-attempt', true);
                }
                numberOfRegion++;
                showQuestion();

            } else {

                $rootScope.$broadcast('showTooltip', {_x: _x, _y: _y, _name: _name});

                errors++;
                if (!attempts[currentQuestion]) {
                    attempts[currentQuestion] = 1;
                } else {
                    attempts[currentQuestion] += 1;
                    if (attempts[currentQuestion] >= 4) {
                        attempts[currentQuestion] = 4;

                        d3.select('.' + regions[numberOfRegion].id).classed('true-region', true);
                    }
                }
            }

        }


        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };


        function calculateResults(_attempts) {
            var sum = 0;
            var points = {
                1: 100,
                2: 67,
                3: 33,
                4: 0
            };
            var score;

            for (var attempt in _attempts) {
                var point = _attempts[attempt];
                sum += points[point];
            }
            score = sum / Object.size(_attempts);
            return score;
        }


        function showQuestion() {
            if (numberOfRegion < quantity) {
                angular.element('#task').html('Click on ' + regions[numberOfRegion].properties.name);
            } else {
                finishGame();
            }
        }

        function finishGame() {
            var score = calculateResults(attempts);

            attempts = {};
            errors = 0;
            numberOfRegion = 0;

            $timeout(function () {
                $rootScope.$broadcast('finishedGame', 'You Win! Your score is ' + score + '%');
            }, 1000);
        }

        return self;
    }]);