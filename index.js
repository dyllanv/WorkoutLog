const baseUrl = `http://flip2.engr.oregonstate.edu:4256/`;

// Deletes workout table body
function deleteTable() {
    var table = document.getElementById("workoutsTable");
    table.removeChild(table.getElementsByTagName("tbody")[0]);
}

// Makes table body with data from database
function makeTable(rows=false) {
    var table = document.getElementById("workoutsTable");
    var body = document.createElement("tbody");
    body.id = "tbody";
    table.appendChild(body);
    for (i=0; i<rows.length; i++) {
        makeRow(rows[i]);
    }
}

// Adds a row to the tbody, then calls for each cell to be added
function makeRow(rowData, headerRow=false) {
    var body = document.getElementById("tbody");
    var row = document.createElement("tr");
    row.id = rowData.id;
    body.appendChild(row);
    
    //Append each of the cells
    makeCell(row, rowData.id, rowData.id, "hidden");
    makeCell(row, rowData.name, rowData.id, "text");
    makeCell(row, rowData.reps, rowData.id, "number");
    makeCell(row, rowData.weight, rowData.id, "number");
    makeRadioInputs(row, rowData.unit, rowData.id);
    makeCell(row, rowData.date, rowData.id, "date");
    makeButton(row, rowData.id, "Update");
    makeButton(row, rowData.id, "Delete");
}

// Adds cell to row, adds input field to each cell, initializes input type,
// class name, and value, then disables inputs
function makeCell(row, value, id, type) {
    var cell = document.createElement("td");
    var input = document.createElement("input");
    input.type = type;
    input.className = id;
    if (input.type == "hidden") {
        input.className = "none";
    }
    input.value = value;
    input.disabled = true;
    input.disabled = true;
    row.appendChild(cell);
    cell.appendChild(input);
}

// Adds cell to row, adds button to cell, and initializes button value, name, 
// and textContent
function makeButton(row, id, txt) {
    var cell = document.createElement("td");
    var button = document.createElement("button");
    button.value = id;
    button.name = txt;
    button.textContent = txt;
    row.appendChild(cell);
    cell.appendChild(button);
}

// Adds cell to row, adds "lbs" and "kgs" labels to cell with two radio
// buttons. Initializes name and class name of radio buttons, disables 
// them, and checks the proper button (lbs by default)
function makeRadioInputs(row, value, id) {
    var cell = document.createElement("td");
    var radio1 = document.createElement("input");
    radio1.type = "radio";
    radio1.name = id;
    radio1.className = id;
    radio1.disabled = true;
    
    var radio2 = document.createElement("input");
    radio2.type = "radio";
    radio2.name = id;
    radio2.className = id;
    radio2.disabled = true;

    if (value == 1) {
        radio2.checked = true;
    } else {
        radio1.checked = true;
    }
    row.appendChild(cell);
    cell.append("lbs");
    cell.appendChild(radio1);
    cell.append("kgs");
    cell.appendChild(radio2);
};


// Sends GET request to server when index.html is visited, 
// receives data from mysql database, populates page/table
function getData(){
    var req = new XMLHttpRequest();
    req.open("GET", baseUrl, true); 
    req.addEventListener('load',function(){
        if(req.status >= 200 && req.status < 400){
            var response = JSON.parse(req.responseText);
            makeTable(response.rows);
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(null);    
};

// Sends POST request to server when exercise/entry is added, 
// receives data from updated mysql database, repopulates page/table
function addEntry(){
    document.getElementById('add').addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        var payload = {name:null, reps:null, weight:null, unit:null, date:null};
        payload.name = document.getElementById('name').value;
        if (payload.name == "") {
            event.preventDefault();
            return
        }
        payload.reps = document.getElementById('reps').value;
        payload.weight = document.getElementById('weight').value;
        if (document.getElementById("kgs").checked) {
            payload.unit = true;
        } else {
            payload.unit = false;
        }
        payload.date = document.getElementById('date').value;
        req.open('POST', baseUrl, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                var response = JSON.parse(req.responseText);
                deleteTable();
                makeTable(response.rows);
            } else {
                console.log("Error in network request: " + req.statusText);
            }
        });
        req.send(JSON.stringify(payload));
        event.preventDefault();
    });
};

// Event listener for entire table, detects if Update or Delete button is clicked
function update () {
    var table = document.getElementById("workoutsTable");
    table.addEventListener('click', (event) => {
        let target = event.target;
        var id = target.value;
        if (target.name == "Update") {
            var inputs = document.getElementsByClassName(id);
            for (i=0; i<6; i++) {
                inputs[i].disabled = false;
            }
            target.textContent = "Done";
            done();
        } else if (target.name == 'Delete') {
            deleteEntry();
        }    
    });
};

// After update button clicked, button toggled to "Done". When clicked again,
// sends PT request to server to update database. No page update needed.
function done(){
    var req = new XMLHttpRequest();
    var payload = {name:null, reps:null, weight:null, unit:null, date:null, id:null};
    let target = event.target;
    target.addEventListener('click', (event) => {
        if (target.textContent == 'Done') {
            var id = target.value;
            payload.id = id;
            var inputs = document.getElementsByClassName(id);
            payload.name = inputs[0].value;
            if (payload.name == "") {
                return
            }
            payload.reps = inputs[1].value;
            payload.weight = inputs[2].value;
            if (inputs[4].checked){
                payload.unit = true;
            } else {
                payload.unit = false;
            }
            payload.date = inputs[5].value;
            req.open('PUT', baseUrl, true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.addEventListener('load',function(){
                if(req.status >= 200 && req.status < 400){
                    for (i=0; i<6; i++) {
                        inputs[i].disabled = true;
                    }
                    target.textContent = "Update";
                } else {
                    console.log("Error in network request: " + req.statusText);
                }
            });
            req.send(JSON.stringify(payload));
            event.preventDefault();
        }
    });
};

// When delete button clicked, sends DELETE request to server to delete
// corresponding exercise/entry. Receives updated data from database and
// repopulates table. Row ID is only data sent.
function deleteEntry(){
    var req = new XMLHttpRequest();
    let target = event.target;
    var id = target.value;
    var payload = {id:null};
    payload.id = parseInt(id);
    req.open('DELETE', baseUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
        if(req.status >= 200 && req.status < 400){
            var response = JSON.parse(req.responseText);
            deleteTable();
            makeTable(response.rows);
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
    event.preventDefault();
};

getData();
document.addEventListener('DOMContentLoaded', addEntry);
document.addEventListener('DOMContentLoaded', update);
