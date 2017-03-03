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
            d3.json('public/data/provincies.json', function (error, states) {
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