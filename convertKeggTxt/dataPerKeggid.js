// Get the uploaded file contents and parse the PathBank JSON
let file = API.getData("filePathbank").resurrect();
let data = JSON.parse(file.replace(/\s+$/, ''));

// Extract the KEGG IDs and filter according to the Compound pattern
let idKegg = pbKeggids(data).filter(k => /^C\d{5}$/.test(k));

// Split into chunks
let chunks = idKegg.chunks(10);

console.log("CHUNKS:\n", chunks);  // debug

// Generate the array of promises per chunk
let promises = chunks.map((chunk, i) => {
  return fetch(keggGetURIMultiple(chunk))
    .then(r => r.text())
    .then(d => {
      // The name is not actually used -- cut this?
      let padLength = chunks.length.toString().length;
      let fragment = i.toString().padStart(padLength, "0");
      let file = {
        name: `keggGetMultiple_chunk${fragment}`,
        content: `${d.replace(/\r/g, '').replace(/\s+$/, '')}\n`
      };
      return file;
    });
});

console.log("PROMISES:\n",promises);  // debug

Promise.allSettled(promises).then(values => {
  /**
   * ChemInfo modifies the values in the Promise, so need to get
   * _settledValueField from each entry.
   */
  // Initialise results array
  let result = new Array();
  // Push the content for each value
  values.forEach(v => result.push(v._settledValueField.content));
  console.log("Saving data....");  // debug
  // Filter undefined/null, and join by newline
  let output = result.filter(r => r !== undefined && r !== null).join("\n");
  // Save the resulting file
  saveData({name: "keggGetMultiple_allPathbank.txt", content: output});
});


/** -- Function definitions -- **/

// Helper function to make a "data anchor" for a plaintext file
function makePlaintextDataAnchor(file) {
  let uc = encodeURIComponent(file.content);
  let hr = `data:text/plain;charset=utf-8,${uc}`;
  let anchor = document.createElement("a");
  anchor.setAttribute("download", (file.name) ? file.name : "saveData.txt");
  anchor.setAttribute("href", hr);
  return anchor;
};

// Helper function to save a plaintext file
function saveData(file) {
  let anchor = makePlaintextDataAnchor(file);
  anchor.click();
  anchor.remove();
  return;
};

// Generate a (ChemInfo proxy) KEGG REST API URI for an array of multiple IDs
function keggGetURIMultiple(chunk) {
  let uri = `https://kegg.cheminfo.org/get/${chunk[0]}`;
  chunk.slice(1).forEach(c => uri += `+${c}`);
  return uri;
};

// Split an array into chunks of the given size
Array.prototype.chunks = function(size = 10) {
  let i = 0;
  let result = new Array();
  result[i] = new Array();
  this.forEach((a, j) => {
    result[i].push(a);
    if (result[i].length === size) {
      result.push(new Array());
      ++i;
    };
  });
  return result.filter(r => r.length !== 0);
};

// Extract the unique KEGG IDs found in the PathBank JSON
function pbKeggids(data) {
  let result = new Array();
  data.forEach(pb => {
    let idk = pb.main["KEGG ID"];
    if (idk === null || idk === undefined) return;
    if (typeof(idk) === "string") {
      if (result.indexOf(idk) === -1) result.push(idk);
      return;
    };
    idk.forEach(id => {
      if (result.indexOf(id) === -1) result.push(id);
    });
    return;
  });
  return result.sort();
};
