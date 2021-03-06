const DEBUG_DATA = false;
const IMAGE_URL = "https://dnaspaces.io/api/location/v1/map/images/floor/"

function getToken(){
    const api_token = document.getElementById('api_token').value;
        console.log("gettoken(): Getting token with length ", api_token.length);
    return "Bearer " + api_token;
}

function getFloorNames(floor_count_data, hierarchy_data) {
    console.log("getFloorNames(): Adding names to floor counts using hierarchy data.");
    console.log("getFloorNames(): First record of floor_count_data ", floor_count_data[0]);
    console.log("getFloorNames(): Hierarchy_data ", hierarchy_data.map[0]);
    let campus_count = 0;
    let building_count = 0;
    let floor_count = 0;
    let floor_names = {};
    let formatDecimalComma = d3.format(",.2f")
    floor_names['floorId'] = [];
    hierarchy_data.map.forEach(function (campus){
        campus_count += 1;
        let building_data = campus.relationshipData.children;
        building_data.forEach(function (b) {
            let building_floors = b.relationshipData.children;
            building_count += 1;
            building_floors.forEach(function (f) {
                floor_names[f.id] = {
                    'name':f.name,
                    'campus':campus.name,
                    'building':b.name,
                    'width': f.details.width,
                    'length': f.details.length,
                    'imageName': IMAGE_URL.concat(f.details.image.imageName)
                };
                if (DEBUG_DATA){
                    console.log("getFloorNames():", campus.name, b.name, f.id, f.name, f.details.image.imageName);
                }
                floor_count += 1;
            })
        });
        })
    document.getElementById('status_hierarchy').textContent = "Hierarchy data: Buildings " + building_count +
        " , Floors " + floor_count;
    console.log("getFloorNames(): Add floor names to count");
    let floor_data_names = [];
    let missed_floors = 0
    floor_count_data.forEach(function (d) {
        if (d.floorId in floor_names){
            floor_data_names.push({
                    'campus': floor_names[d.floorId].campus,
                    'building': floor_names[d.floorId].building,
                    'name': floor_names[d.floorId].name,
                    'floorName': floor_names[d.floorId].name,
                    'width': floor_names[d.floorId].width,
                    'length': floor_names[d.floorId].length,
                    'floorId': d.floorId,
                    'imageName': floor_names[d.floorId].imageName,
                    'count': d.count
            });
            if (DEBUG_DATA) {
                console.log("getFloorNames(): Found floor name", floor_names[d.floorId]);
            }
        } else {
                console.log("getFloorNames(): Could not find floor id in hierachy. Skipping.", d.floorId)
                missed_floors += 1;
        }
    });
    console.log("Total number of floor counts not found in hierarchy", missed_floors);
    return floor_data_names;
}

function getFloorCount(floor_count_raw) {
    console.log("getFloorCount(): Get floor count from data.");
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
    console.log("create_table(): Creating table with data. Total records ", table_data.length);
    let formatDecimalComma = d3.format(",.2f")
    d3.select("#floor_count_table").select("table").remove();
    var headers = [
        "Reference",
        "Campus",
        "Building Name",
        "Floor Name",
        "Floor Id",
        "Width",
        "Length",
        "Count"
    ]
    d3.select("#floor_count_table")
        .append("table").attr("class", "table table-responsive-sm table-hover")
        .append("tbody");

    d3.select("tbody")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .text(function(d){
            return d
        });
    // fill the table
    // create rows
    var tr = d3.select("tbody").selectAll("tr")
        .data(table_data)
        .enter()
        .append("tr")
        .on("click", function(d) {
            $(this).addClass('table-dark').siblings().removeClass('table-dark');
            console.log("create_table() on-click ", d.imageName, d.floorName, d.floorId, d.width, d.length);
            fetchImageAndDisplay(d.imageName, d.floorName, d.floorId, d.width, d.length);
        });
    // cells
    var found_first_image = false;
    tr.each(function(d, i) {
        if (found_first_image == false){
            $(this).addClass('table-dark').siblings().removeClass('table-dark');
            fetchImageAndDisplay(d.imageName, d.floorName, d.floorId, d.width, d.length);
            found_first_image = true;
            console.log("Getting first row image", d.imageName);
        }
       	var self = d3.select(this);
            self.append("td")
                .text(i);
            self.append("td")
                .text(d.campus);
            self.append("td")
                .text(d.building);
            self.append("td")
                .text(d.floorName);
            self.append("td")
                .text(d.floorId);
            self.append("td")
                .text(formatDecimalComma(d.width));
            self.append("td")
                .text(formatDecimalComma(d.length));
        	self.append("td")
        		.text(d.count);
      });
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
    var margin = {top: 50, right: 20, bottom: 50, left: 50},
        width = 960 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

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
    x.domain(data.map(function(d, i) { return i; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i) { return x(i); })
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

}

// Converts any given blob into a base64 encoded string.
function convertBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);

  });

}

async function fetchImageAndDisplay(url, floor_name, floorId, width, length){
    console.log("fetchImageAndDisplay():", url, floor_name, width, length);
    document.getElementById('floor_image_status').textContent = "Loading image " + floor_name;
    const image = d3.select("#image");
    const token = getToken();
    try {
        const fetchResult = await fetch(url, {
            headers: new Headers({
                "Authorization": token
            }),
        })
//        image.style.width = 'auto'
//        image.style.height = 'auto'
        var image_data = await convertBlobToBase64(await fetchResult.blob());
//        image.src = image_data;
        image.append('image')
            .attr('xlink:href', image_data)
            .attr('height', '800')
            .attr('width', '960');
        console.log("fetchImageAndDisplay(): Finished.");
        document.getElementById('floor_image_status').textContent = "Done loading image " + floor_name;
        fetchDeviceLocation(floorId, width, length);
      } catch (error) {
        console.error(error);
        }
}

function fetchDeviceLocation(floorId, width, length){
    console.log("fetchDeviceLocation(): called with floor id ", floorId, width, length);
    const token = getToken();
    const url = "https://dnaspaces.io/api/location/v1/clients?deviceType=CLIENT&limit=10000&floorId=" + floorId;
    const urls = [url];
   var promises = urls.map(url => fetch(url, {
            headers: new Headers({
                "Authorization": token
            }),
        }).then(r => {
            if (!r.ok){
                console.log("fetchDeviceLocation(): Did not get ok message from server.", r.status);
                if (r.status == 401){
                    document.getElementById('floor_image_status').textContent = "Got unauthorized. Invalid token.";
                } else {
                    document.getElementById('floor_image_status').textContent = "Connection error. Status code" +
                        r.status;
                }
                throw new Error("fetchDeviceLocation(): Invalid HTTP status " + r.status);
            }
            document.getElementById('floor_image_status').textContent = "Adding devices.";
            return r.text();
    }));
    // Now get a Promise to run all those Promises in parallel
    Promise.all(promises)
    .then(bodies => {
        console.log("fetchDeviceLocation(): All URL's have resolved. Number of results ", bodies.length);
        if (bodies.length >= 1) {
            var valid_json = false;
            try {
                var client_data = JSON.parse(bodies[0]);
                console.log("fetchDeviceLocation(): data", client_data);
                valid_json = true;
            } catch (e) {
                document.getElementById('floor_image_status').textContent = "Device location JSON parse error " + e;
            }
            if (valid_json) {
                console.log("fetchDeviceLocation(): Total number of clients found on floor", client_data.results.length);
                document.getElementById('floor_image_status').textContent = "Number of devices found " + client_data.results.length;
                plotDevices(client_data.results, width, length);
            }
        }
    });
    console.log("fetchDeviceLocation(): finished.");
    return;
}

function plotDevices(client_location, max_width, max_length){
    console.log("plotDevices(): called", client_location,length, max_width, max_length);
    var data = client_location;
    client_location.forEach(function(d){
        console.log("plotDevices(): Coordinates", d.coordinates);
    })
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 960 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // set the ranges
    console.log("plotDevices(): x domain range ", max_width, width);
    console.log("plotDevices(): y domain range ", max_length, height);
    var xScale = d3.scaleLinear()
        .domain([0, max_width])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([max_length, 0])
        .range([height, 0]);
    console.log("plotDevices(): x value 100 scaled to ", xScale(100));
    console.log("plotDevices(): y value 100 scaled to ", yScale(100));

//    x.domain(data.map(function(d, i) { return i; }));
//    y.domain([0, d3.max(data, function(d) { return d.count; })]);

   d3.select("#image").append("g").attr("id", "devices")
       .selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("r", 4)
       .attr("cx", function(d){ return xScale(d.coordinates[0])})
       .attr("cy", function(d){ return yScale(d.coordinates[1])})
       .style("fill", "lime");
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






