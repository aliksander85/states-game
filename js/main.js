;(function () {

    var width = 960
        , height = 800
        , svg
        , regions = []
        , quantity
        , numberOfRegion = 0
        , currentQuestion = ''
        , currentAttempts = {}
        , countries
        , errors = 0;

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

            showQuestionnaire(allRegions, chosenCountry);

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
                    console.log('NAME', d.properties.name);
                    checkAnswer(d.properties.name, this);
                })
                .attr("d", path);

        });
    }

    function checkAnswer(_name, _regionEl) {
        if (numberOfRegion >= quantity) return;
        currentQuestion = regions[numberOfRegion].properties.name;
        if (_name === currentQuestion) {

            if (!currentAttempts[currentQuestion]) {
                currentAttempts[currentQuestion] = 1;
                d3.select(_regionEl).classed('first-attempt', true);
            } else if (currentAttempts[currentQuestion] == 1) {
                d3.select(_regionEl).classed('second-attempt', true);
            } else if (currentAttempts[currentQuestion] >= 2) {
                d3.select(_regionEl).classed('third-attempt', true);
            }
            numberOfRegion++;
            showQuestion();

        } else {

            errors++;
            if (!currentAttempts[currentQuestion]) {
                currentAttempts[currentQuestion] = 1;
            } else {
                currentAttempts[currentQuestion] += 1;
                // TODO: stop increasing of errors if quantity of errors for this region is 3
            }
        }

        document.getElementById('score').innerText = errors;
    }

    function showQuestion() {
        if (numberOfRegion < quantity) {
            document.getElementById('task').innerText = 'Click on ' + regions[numberOfRegion].properties.name;
        } else {
            document.getElementById('task').innerText = 'You Win!';
            console.log('currentAttempts', currentAttempts);
            console.log('errors', errors);
        }
    }

    function showQuestionnaire(_regions, chosenCountry) {
        var countryRegions = [];
        for (var i = 0; i < _regions.length; i++) {
            if (_regions[i].properties.admin === chosenCountry) {
                if (_regions[i].properties.name === 'Jervis Bay Territory') { continue; }
                if (_regions[i].properties.name === 'District of Columbia') { continue; }
                countryRegions.push(_regions[i]);
            }
        }
        shuffle(countryRegions);
        regions = countryRegions.slice();
        quantity = regions.length;
        showQuestion();
    }



    function initialize() {

        svg = d3.select("#svg-container").append("svg")
            .attr('class', 'map')
            .attr("width", width)
            .attr("height", height);

        countries = ['Australia', 'Brazil', 'Canada', 'United States of America'];

        var chosenCountry = countries[3];
        var chosenProjection = chooseProjection(chosenCountry);
        var path = d3.geoPath().projection(chosenProjection);

        drawMap(path, chosenCountry);

        document.getElementById('australia').onclick = function() { console.log('AUS'); };
        document.getElementById('brazil').onclick = function() { console.log('BRA'); };
        document.getElementById('canada').onclick = function() { console.log('CAN'); };
        document.getElementById('usa').onclick = function() { console.log('USA'); };

    }

    initialize();

}());