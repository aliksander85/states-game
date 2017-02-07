;(function () {

    var width = 960,
        height = 1160;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var projectionCanada = d3.geoEquirectangular()
        .scale(450)
        .translate([width + 400, 700]);

    var path = d3.geoPath().projection(projectionCanada);

    d3.json('../data/provincies.json', function (error, states) {
        if (error) {
            return console.error(error);
        }
        console.log('states', states);

        svg.selectAll(".subunit")
            .data(topojson.feature(states, states.objects.new_lakes).features)
            .enter().append("path")
            .attr("class", function(d) {
                return "subunit " + d.id;
            })
            .attr('fill', '#ccc')
            .attr('stroke', '#777')
            .on('mouseover', function() {
                d3.select(this)
                    .attr("fill", "red");
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr("fill", '#ccc');
            })
            .on('click', function(d) {
                console.log('NAME', d.properties.name);
            })
            .attr("d", path);

    })

}());