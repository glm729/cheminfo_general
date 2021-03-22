# Convert PathBank CSV to JSON
#### Mr. George L. Malone
#### 22<sup>nd</sup> of March, 2021


#### Overview

The purpose of this document is to describe the scripts and operations required
to reduce and reformat the PathBank [_Metabolite names linked to PathBank
pathways CSV_](https://pathbank.org/downloads/) data.  The operations were
completed using Ruby and JavaScript.


#### Operations

Using a Ruby script, the data were reduced to entries relating to _H. sapiens_
only and output as a TSV, resulting in a reduction from ~1.2GB to ~510MB.  This
was necessary, as uploading the unmodified CSV or the zipped version into
ChemInfo caused the browser to crash (may not be ChemInfo-specific, but I
didn't test it further).  Using JavaScript, these data were then rearranged to
feature one entry per unique SMILES code.  As this is somewhat
multi-dimensional, mainly due to retaining context for the pathways data, the
total reduction in size is significant (510MB > 172MB) when associating an
array of objects of pathways data per SMILES code.  Reducing the input TSV to a
JSON takes some time on a decently powerful machine, not sure exactly how long
because I walked away each time I ran it, but it took at least 20 minutes and
most probably more than half an hour.  There are 55,292 unique SMILES codes in
the resulting JSON.


#### Scripts

###### Ruby

```ruby
# Require package "CSV"
require("csv");

# Define file paths in and out
fpath_in = "./data/pathbank_all_metabolites.csv";
fpath_out = "./data/pathbankall_shortlist.tsv";

# Initialise results array
result = Array.new();

# For each row in the input file
File.foreach(fpath_in) do |row|
  # Parse the row as CSV data
  parsedRow = CSV.parse(row)[0];
  # If the results object is empty, push the header row and skip on
  if (result.length == 0)
    result << parsedRow;
    next;
  end;
  # If the organism is H. sapiens, push to the results
  result << parsedRow if (parsedRow[3] == "Homo sapiens");
end;

# Prepare the output string
output = %Q[#{result.map {|r| r.join("\t")}.join("\n")}\n];

# Write to the output file
File.open(fpath_out, "w") {|file| file.write(output)};
```

###### JavaScript

```javascript
// Get the TSV content and set parser options
let tsv = API.getData("tsvUpload").resurrect();
let opt = {delimiter: "\t", header: true};

// Parse the TSV text
let dataTsv = Papa.parse(tsv.replace(/\s+$/, ''), opt).data;

// Get the common keys
let keys = Object.keys(dataTsv[0]);

// Specify pathway keys, generally excluded keys, and main keys
let pathwayKeys = ["PathBank ID", "Pathway Name", "Pathway Subject"];
let excludeKeys = ["SMILES", pathwayKeys].flat();
let mainKeys = keys.filter(k => excludeKeys.indexOf(k) === -1);

// Get the non-missing SMILES codes
let smiles = [...new Set(dataTsv.map(d => d.SMILES))]
  .filter(d => d !== '').sort();

// Get the relevant data per SMILES code
let data = smiles.map(code => {
  return perCode(code, dataTsv, mainKeys, pathwayKeys);
});

// Initialise the file data
let file = {
  name: "PathBankJson.json",
  text: JSON.stringify(data, null, 0)
};

// Set the save file button
saveFileButton("#dlButtonLocation", file);


/** -- Function definitions -- **/

// Get data per unique SMILES code
function perCode(code, data, mainKeys, pathwayKeys) {
  let obj = new Object();
  let subset = data.filter(d => d.SMILES === code);
  obj.SMILES = code;
  obj.main = getMainData(subset, mainKeys);
  obj.pathways = getPathwaysData(subset, pathwayKeys);
  return obj;
};

// Get the "main" data per SMILES code
function getMainData(subset, mainKeys) {
  let output = new Object();
  mainKeys.forEach(key => {
    if (output[key] === undefined) output[key] = new Array();
    subset.forEach(sub => output[key].push(sub[key]));
    output[key] = reduceObjKey(output[key]);
  });
  return output;
};

// Get the pathways data per SMILES code (different format)
function getPathwaysData(subset, pathwayKeys) {
  let output = new Array();
  subset.forEach(sub => {
    let obj = new Object();
    pathwayKeys.forEach(key => obj[key] = sub[key]);
    output.push(obj);
  });
  return output;
};

// Reduce an object per key to minimal unique entries
function reduceObjKey(data) {
  let dataNew = [...new Set(data)].filter(d => d !== '');
  if (dataNew.length === 0) return null;
  if (dataNew.length === 1) return dataNew[0];
  return dataNew;
};

// Create a button to save a file
function saveFileButton(selector, fileDetails) {
  // Query the sink
  let sink = document.querySelector(selector);
  // Create elements
  let a = document.createElement("a");
  let b = document.createElement("button");
  // Apply styles and whatnot
  a.style.display = "none";
  b.style.display = "block";
  b.style.borderRadius = "0";
  b.style.fontFamily = "monospace";
  b.style.fontWeight = "bold";
  b.innerHTML = "BUTTON";
  b.onclick = _ => a.click();
  // Prepare file data
  let uriComponent = encodeURIComponent(fileDetails.text);
  let dataHref = `data:application/json;charset=utf-8,${uriComponent}`;
  // Set operational attributes
  a.setAttribute("download", fileDetails.name);
  a.setAttribute("href", dataHref);
  // Clear the sink, and append
  sink.innerHTML = '';
  sink.appendChild(a);
  sink.appendChild(b);
};
```
