function getToken(){
    const api_token = document.getElementById('api_token').value;
    return "Bearer " + api_token;
}

function getFloorNames(floor_count_data, hierarchy_data) {
    console.log("Adding names to floor counts using hierarchy data.");
    let floor_names = {};
    floor_names['floorId'] = [];
    let building_data = hierarchy_data.map[0].relationshipData.children;
    building_data.forEach(function (d) {
        let building_floors = d.relationshipData.children;
        building_floors.forEach(function (f) {
            floor_names[f.id] = {'name':f.name, 'building':d.name};
            console.log(d.name, f.id, f.name);
            console.log(f.id, floor_names[f.floorId]);
        })

    });
    console.log("Add floor names to count");
    let floor_data_names = [];
    floor_count_data.forEach(function (d) {
        floor_data_names.push({
            'building': floor_names[d.floorId].building,
            'name': floor_names[d.floorId].name,
            'floorId': d.floorId,
            'count': d.count
        });
        console.log("Found floor name", floor_names[d.floorId]);
        })
    return floor_data_names;
}
function getFloorCount(floor_count_raw) {
    console.log("Get floor count from data.");
    let floor_data = [];
    let floor_list = floor_count_raw.results;
    floor_list.forEach(function (d) {
        floor_data.push({'floorId': d.floorId, 'count': d.count});
    });
    console.log(floor_data);
    return floor_data;
}

function create_table(table_data) {
    // create the table header
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

function getClientCount(){
    console.log("Get client floor count data.");
    const token = getToken();
    const urls = [
        "https://dnaspaces.io/api/location/v1/clients/floors",
        "https://dnaspaces.io/api/location/v1/map/hierarchy"
    ];
    var promises = urls.map(url => fetch(url, {
            headers: new Headers({
                "Authorization": token
            }),
        }).then(r => r.text()));
    // Now get a Promise to run all those Promises in parallel
    Promise.all(promises)
    .then(bodies => {
        var floor_count_raw = JSON.parse(bodies[0]);
        var floor_count_data = getFloorCount(floor_count_raw);
        var hierarchy_data = JSON.parse(bodies[1]);
        var floor_count_names = getFloorNames(floor_count_data, hierarchy_data);
        return create_table(floor_count_names);
    }).catch(e => console.error(e));
}






