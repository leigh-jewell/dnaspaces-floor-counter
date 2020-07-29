const DEBUG_DATA = false;

function getToken(){
    const api_token = document.getElementById('api_token').value;
        console.log("gettoken(): Getting token with length ", api_token.length);
    return "Bearer " + api_token;
}

function getFloorNames(floor_count_data, hierarchy_data) {
    console.log("getFloorNames(): Adding names to floor counts using hierarchy data.");
    console.log("getFloorNames(): Firs record of floor_count_data ", floor_count_data[0]);
    console.log("getFloorNames(): Hierarchy_data ", hierarchy_data.map[0]);
    let building_count = 0;
    let floor_count = 0;
    let floor_names = {};
    floor_names['floorId'] = [];
    let building_data = hierarchy_data.map[0].relationshipData.children;
    var formatDecimalComma = d3.format(",.2f")
    building_data.forEach(function (b) {
        let building_floors = b.relationshipData.children;
        building_count += 1;
        building_floors.forEach(function (f) {
            floor_names[f.id] = {
                'name':f.name,
                'building':b.name,
                'width': formatDecimalComma(f.details.width/3.3),
                'length': formatDecimalComma(f.details.length/3.3)
            };
            if (DEBUG_DATA){
                console.log("getFloorNames():", b.name, f.id, f.name);
            }
            floor_count += 1;
        })
    });
    document.getElementById('status_hierarchy').textContent = "Hierarchy data: Buildings " + building_count +
        " , Floors " + floor_count;
    console.log("getFloorNames(): Add floor names to count");
    let floor_data_names = [];
    floor_count_data.forEach(function (d) {
        floor_data_names.push({
            'building': floor_names[d.floorId].building,
            'name': floor_names[d.floorId].building + ":" + floor_names[d.floorId].name,
            'floor_name': floor_names[d.floorId].name,
            'width': floor_names[d.floorId].width,
            'length': floor_names[d.floorId].length,
            'floorId': d.floorId,
            'count': d.count
        });
        if (DEBUG_DATA) {
            console.log("getFloorNames(): Found floor name", floor_names[d.floorId]);
        }
    });
    return floor_data_names;
}

function getFloorCount(floor_count_raw) {
    console.log("getFloorCount(): Get floor count from data. Total raw records ", floor_count_raw.length);
    let floor_data = [];
    let floor_list = floor_count_raw.results;
    let number_floors = 0;
    floor_list.forEach(function (d) {
        floor_data.push({'floorId': d.floorId, 'count': d.count});
        number_floors += 1;
    });
    document.getElementById('status_floors').textContent = "Floor count data: Floor counts " + number_floors +
    ". ";
    console.log("getFloorCount(): counted total floors ", number_floors);
    return floor_data;
}

function create_table(table_data) {
    console.log("create_table(): Creating table with data. Total records ", table_data.length)
    // create the table header
    d3.select('#floor_count').selectAll('tr').remove();
    var thead = d3.select("thead").selectAll("th")
      .data(d3.keys(table_data[0]))
      .enter().append("th").text(function(d){return d});
    // fill the table
    // create rows
    var tr = d3.select("tbody").selectAll("tr")
        .data(table_data).enter().append("tr")
    // cells
    var td = tr.selectAll("td")
        .data(function(d){return d3.values(d)})
        .enter().append("td")
        .text(function(d) {return d})
    return;
};

function drawVis(all_data){
    const MAX_DATA = 15;
    all_data = all_data.sort(function (a, b) {
            return d3.ascending(b.count, a.count);
    })
    // Take the top largest elements from data so arrary is not too big.
    var data = all_data.slice(0, MAX_DATA);
    // set the dimensions and margins of the graph
    var margin = {top: 50, right: 20, bottom: 180, left: 50},
            width = 1200 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
              .range([0, width])
              .padding(0.1);
    var y = d3.scaleLinear()
              .range([height, 0]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    d3.selectAll("g > *").remove();
    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // get the data
    data.forEach(function(d) {
    d.count = +d.count;
    });

    // Scale the range of the data in the domains
    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.name); })
      .attr("width", Math.min(x.bandwidth(), 100))
      .attr("y", function(d) { return y(d.count); })
      .attr("height", function(d) { return height - y(d.count); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // add the y Axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // text label for the y axis
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Count");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 10 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Top floor counts");

}

function getClientCount(){
    console.log("getClientCount(): Get client floor count data.");
    document.getElementById('api_token_help').textContent = "Processing..";
    document.getElementById('api_token_help').classList.add("text-muted");
    document.getElementById('api_token').classList.remove("is-invalid");
    document.getElementById('api_token').classList.remove("valid");
    const token = getToken();
    const urls = [
        "https://dnaspaces.io/api/location/v1/clients/floors",
        "https://dnaspaces.io/api/location/v1/map/hierarchy"
    ];
    console.log("getClientCount(): Getting the following URL's", urls);
    var promises = urls.map(url => fetch(url, {
            headers: new Headers({
                "Authorization": token
            }),
        }).then(r => {
            if (!r.ok){
                console.log("getClientCount(): Did not get ok message from server.", r.status);
                if (r.status == 401){
                    document.getElementById('api_token_help').textContent = "Got unauthorized. Invalid token.";
                } else {
                    document.getElementById('api_token_help').textContent = "Connection error. Status code" +
                        r.status;
                }
                document.getElementById('api_token').classList.add("is-invalid");
                throw new Error("getClientCount(): Invalid HTTP status " + r.status);
            }
            document.getElementById('api_token_help').textContent = "Processing. Connected. Downloading..";
            document.getElementById('api_token').classList.add("is-valid");
            return r.text();
    }));
    // Now get a Promise to run all those Promises in parallel
    Promise.all(promises)
    .then(bodies => {
        console.log("getClientCount(): All URL's have resolved. Number of results ", bodies.length);
        if (bodies.length >= 2){
            var valid_json = false;
            try {
                var floor_count_raw = JSON.parse(bodies[0]);
                var floor_count_data = getFloorCount(floor_count_raw);
                valid_json = true;
            } catch(e) {
                document.getElementById('api_token_help').textContent = "Floor count JSON parse error " + e;
            }
            if (valid_json){
                valid_json = false;
                try {
                    var hierarchy_data = JSON.parse(bodies[1]);
                    var floor_count_names = getFloorNames(floor_count_data, hierarchy_data);
                    valid_json = true;
                } catch(e) {
                    document.getElementById('api_token_help').textContent = "Map hierarchy JSON parse error "
                        + e;
                }
            }
            if (valid_json) {
                create_table(floor_count_names);
                drawVis(floor_count_names);
                document.getElementById('api_token_help').textContent = "Done.";
                document.getElementById('api_token').classList.remove("is-valid");
            }

        } else {
            document.getElementById('api_token_help').textContent = "Error. Did not get API returns from DNA Spaces";
        }
        return;
    }).catch(e => console.error(e));
}






