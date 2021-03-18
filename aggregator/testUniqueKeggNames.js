/**
 * This script is for checking the uniqueness of KEGG ID-to-name links, that
 * is, for checking how many KEGG IDs are linked to each unique name in the
 * List Compound API operation.  The purpose is to identify how many unique
 * names are associated with multiple IDs.  See the associated Markdown file
 * for a bit more detail.
 */


// Create the Promise for the KEGG List Compound proxy op
let link = "https://kegg.cheminfo.org/list/compound";
let ft = fetch(link).then(r => r.text());

// Operate
ft.then(fileKegg => {
  let data = parseKegg(fileKegg);
  let nameUniq = getKeggUniqueNames(data);
  let gt1 = keggidPerNameGt1(nameUniq, data);
  console.log(converseOperation(gt1));
  saveJson(gt1, "keggNamesGt1Id");
});


/** -- Function definitions -- **/

// Helper function to parse the KEGG List Compound TSV
function parseKegg(file) {
  let opts = {delimiter: "\t", header: false};
  let parsed = Papa.parse(file.replace(/\s+$/, ''), opts).data;
  let obj = parsed.map(p => {
    return {id: p[0].replace(/^cpd:/, ''), name: p[1].split(/; /)};
  });
  return obj;
};

// Get the unique names in KEGG List Compound
function getKeggUniqueNames(data) {
  let nameUniq = new Array();
  data.forEach(d => {
    d.name.forEach(n => {
      if (nameUniq.indexOf(n) === -1) nameUniq.push(n);
    });
  });
  return nameUniq.sort();
};

// Get the KEGG IDs per name, if the number of IDs is greater than 1
function keggidPerNameGt1(nameUniq, data) {
  let result = new Array();
  nameUniq.forEach(name => {
    let sub = data.filter(d => d.name.indexOf(name) !== -1);
    if (sub.length > 1) {
      let ids = sub.map(s => s.id);
      result.push({name: name, idMultiple: ids});
    };
  });
  return result;
};

// Converse of original
function converseOperation(data) {
  let ids = [...new Set(data.map(d => d.idMultiple).flat())].sort();
  let result = new Array();
  let consider = data.slice().map((d, i) => {
    d.index = i;
    return d;
  });
  ids.forEach(id => {
    let sub = consider.filter(d => d.idMultiple.indexOf(id) !== -1);
    if (sub.length > 1) {
      result.push({id: id, data: sub});
      // Avoid repeats
      sub.forEach(s => consider = consider.filter(c => c.index !== s.index));
    };
  });
  return result;
};

// Helper function for saving a JSON-type (i.e. data storage) Object
function saveJson(json, name) {
  let n = (/\.json$/.test(name)) ? name : `${name}.json`;
  let uc = encodeURIComponent(JSON.stringify(json, null, 2));
  let hr = `data:application/json;charset=utf-8,${uc}`;
  let anchor = document.createElement("a");
  anchor.setAttribute("download", n);
  anchor.setAttribute("href", hr);
  anchor.click();
  anchor.remove();
  return;
};
