# KEGG Compound:  Name-ID crossover
#### Mr. George L. Malone
#### 18<sup>th</sup> of March, 2021


## Overview

This document summarises the overlap between unique names and unique KEGG IDs
found in the data obtained by the KEGG List Compound REST API operation.


## Methods

The complete JavaScript script used to perform the operations is provided at
the end of this document.

The data were requested via the ChemInfo proxy and parsed using the Papaparser
library, then converted to a JSON-style format to provide context, rather than
a simple array of arrays.  The unique names were extracted from the data.  For
each name, the data were filtered to the entries which contained the name.  If
the filter result contained only one entry, it was ignored.  The result is an
array of objects whereby the KEGG IDs for each name are retained if the name
corresponds to more than one entry in the KEGG data.

Example output:

```json
[
  {
    "name": "1,2,3,4,5,6-Hexachlorocyclohexane",
    "idMultiple": [
      "C07075",
      "C18738"
    ]
  },
  {
    "name": "13-Dihydrodaunorubicin",
    "idMultiple": [
      "C12430",
      "C12433"
    ]
  },
  {
    "name": "3-Phosphoglycerate",
    "idMultiple": [
      "C00197",
      "C00597"
    ]
  },
  ...
]
```


## Results

There are 81 names in KEGG that are featured in at least two KEGG List Compound
entries.  Of these data, almost all names correspond to two IDs.  One name
("Acceptor") is an exception to this, whereby it is associated with three IDs.
The "converse operation", checking how many of the IDs are associated with
multiple names, shows that five of the IDs are each associated with two names.
A summary of the converse operation is shown below.

KEGG ID | Names
:-----  | :--
C00149  | Malate, Malic acid
C00530  | Hydroquinone, Quinol
C00580  | Methyl sulfide, Methyl thioether
C01197  | Caffeate, Caffeic acid
C21221  | CSP, Competence-stimulating peptide


## Script

```javascript
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
```
