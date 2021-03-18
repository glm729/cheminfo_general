# PathBank:  Name-ID crossover
#### Mr. George L. Malone
#### 18<sup>th</sup> of March, 2021


## Overview

This document summarises the overlap between unique names and unique SMILES
codes found in the PathBank JSON achieved by converting the [_Metabolite names
linked to PathBank pathways CSV_](https://pathbank.org/downloads) (details of
the conversion are yet to be provided).


## Methods

The complete JavaScript script used to complete this investigation is provided
at the end of this document.

The data were uploaded to ChemInfo using a drag and drop module and parsed as
JSON.  All unique names were extracted from the data.  The total number of
unique names was 55,751.  The data were subset according to each unique name.
If the name was found to be linked to more than one entry, the data were
retained.


## Results

Confusingly, all unique names in the PathBank JSON are associated with strictly
one SMILES code.


## Script

```javascript
// Bring in the data and parse as JSON
let filePathbank = API.getData("filePathbank").resurrect();
let dataPathbank = JSON.parse(filePathbank.replace(/\s+$/, ''));

// Get the unique names in the data
let names = getNamesPathbank(dataPathbank);

// Initialise the results array
let result = new Array();

// For each unique name
names.forEach(name => {
  // Subset the data
  let subset = dataPathbank.filter(d => dfilter(d, name));
  // If there's more than one entry per name, push to the results
  if (subset.length > 1) result.push({name: name, data: subset});
  return;
});

console.log(result);
// ^ !!! ALL name-SMILES pairs are unique!?


// Abstracted filter for subsetting the PathBank data
function dfilter(d, name) {
  let dn = d.main["Metabolite Name"];
  // Skip if no name
  if (dn === null || dn === undefined) return false;
  // Singular match if string
  if (typeof(dn) === "string") return dn === name;
  // Check if within array of names
  return dn.indexOf(name) !== -1;
};

// Extract the metabolite names from the PathBank main data
function getNamesPathbank(data) {
  let result = new Array();
  data.forEach(d => {
    let name = d.main["Metabolite Name"];
    // Skip if no name
    if (name === null || name === undefined) return;
    // Coerce to array if not already
    if (typeof(name) === "string") name = [name];
    name.forEach(n => {
      // If the name isn't already present, push it
      if (result.indexOf(n) === -1) result.push(n);
    });
  });
  // Return sorted array of names
  return result.sort();
};
```
