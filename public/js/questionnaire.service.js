angular
    .module('statesGame')
    .service('Questionnaire', ['$rootScope', function ($rootScope) {
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

            $rootScope.$broadcast('finishedGame', 'You Win! Your score is ' + score + '%');
        }

        return self;
    }]);