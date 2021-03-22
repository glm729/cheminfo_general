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
  text: JSON.stringify(data)
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
