;(function () {

    var map
        , questionnaire
        , mainInterface;


    var Questionnaire = function() {
        
        var self = this
            , numberOfRegion = 0
            , attempts = {}
            , errors = 0;

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

                map.showTooltip(_x, _y, _name);

                setTimeout(map.hideTooltip, 1500);

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

            document.getElementById('score').innerText = errors;
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
            // console.log('SUM', sum);
            score = sum / Object.size(_attempts);
            return score;
        }


        function showQuestion() {
            if (numberOfRegion < quantity) {
                document.getElementById('task').innerText = 'Click on ' + regions[numberOfRegion].properties.name;
            } else {
                // console.log('a, attempts = {}ttempts', attempts);
                // console.log('errors', errors);
                var score = calculateResults(attempts);

                document.getElementById('task').innerText = 'You Win! Your score is ' + score + '%';
                mainInterface.showCountryList(true);

                attempts = {};
                errors = 0;
            }
        }
    };




    var Map = function() {

        var self = this;

        self.initialize = initialize;
        self.showTooltip = showTooltip;
        self.hideTooltip = hideTooltip;

        var width = 960
            , height = 800
            , svg
            , tooltip
            , regions = []
            , quantity
            , currentQuestion = ''
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
        
        function initialize() {

            svg = d3.select("#svg-container").append("svg")
                .attr('class', 'map')
                .attr("width", width)
                .attr("height", height);

            countries = ['Australia', 'Brazil', 'Canada', 'United States of America'];

            document.getElementById('australia').onclick = function() {
                chooseCountry(0);
            };
            document.getElementById('brazil').onclick = function() {
                chooseCountry(1);
            };
            document.getElementById('canada').onclick = function() {
                chooseCountry(2);
            };
            document.getElementById('usa').onclick = function() {
                chooseCountry(3);
            };
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
                console.log('states', states);

                var allRegions = states.objects.new_lakes.geometries.slice();

                questionnaire.showQuestionnaire(allRegions, chosenCountry);

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
                            .attr("fill", '#777');
                    })
                    .on('mouseout', function() {
                        d3.select(this)
                            .attr("fill", '#ccc');
                    })
                    .on('click', function(d) {
                        // console.log('NAME', d.properties.name);
                        questionnaire.checkAnswer(d.properties.name, this, d3.event.pageX, d3.event.pageY);
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
            mainInterface.showCountryList(false);

            var chosenCountry = countries[_index];
            var chosenProjection = chooseProjection(chosenCountry);
            var path = d3.geoPath().projection(chosenProjection);

            drawMap(path, chosenCountry);
        }

    };




    var MainInterface = function() {

        var self = this;

        self.showCountryList = showCountryList;

        function showCountryList(_show) {
            if (_show) {
                document.getElementById('countries-list').style.display = 'block';
            } else {
                document.getElementById('countries-list').style.display = 'none';
            }
        }

    };

    




    


    function initialize() {

        map = new Map();
        questionnaire = new Questionnaire();
        mainInterface = new MainInterface();

        map.initialize();

    }

    initialize();

}());