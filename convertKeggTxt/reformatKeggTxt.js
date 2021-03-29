// Get the KEGG Compound text file content from the API
let txt = API.getData("txtKegg").resurrect();

// - Split text into per-compound data by triple-slash
// - Split each entry by newline and filter empty
// - Push new array to accumulator if length > 0
let data = txt.split(/\/\/\//).slice(0, 6).reduce((a, c) => {
  let rs = c.split(/\n/).filter(s => s !== '');
  if (rs.length > 0) a.push(rs);
  return a;
}, new Array());

// Sift the data into segmented components
let segmented = data.map(d => segmentKeggEntry(d));
console.log(segmented);  // debug

// Save the result as a JSON
saveJsonString({
  name: "keggCompoundReformat.json",
  content: JSON.stringify(segmented, null, 2)
});


/** -- Function definitions -- **/

// Break the KEGG Compound entry into segments
function segmentKeggEntry(text) {
  let obj = new Object();
  let currentSegment;
  text.forEach(t => {
    if (/^\w+/.test(t)) {
      currentSegment = t.match(/^(?<seg>\w+)/).groups.seg.toLowerCase();
      obj[currentSegment] = new Array();
    };
    obj[currentSegment].push(t.replace(/^(\w+)?\s+/, ''));
  });
  Object.keys(obj).forEach(k => {
    obj[k] = keggCompoundDataSwitch(k, obj[k].join("\n"));
  });
  return obj;
};

// Handle the ENTRY segment
function keggCompoundEntry(text) {
  let data = text.split(/\s+/);
  return {database: data[1], id: data[0]};
};

// Handle the REACTION segment
function keggCompoundReaction(text) {
  let data = text.split(/\n/).map(t => t.split(/ /)).flat();
  return data;
};

// Handle the PATHWAY segment
function keggCompoundPathway(text) {
  let result = new Array();
  let data = text.split(/\n/);
  data.forEach(d => {
    let i = d.split(/  /);
    result.push({id: i[0], name: i[1]});
  });
  return result;
};

// Handle the NAME segment
function keggCompoundName(text) {
  let data = text.split(/\n/).map(t => t.replace(/;$/, ''));
  return data;
};

// Handle the MODULE segment
function keggCompoundModule(text) {
  let result = new Array();
  let data = text.split(/\n/);
  data.forEach(d => {
    let i = d.split(/  /);
    result.push({id: i[0], description: i[1]});
  });
  return result;
};

// Handle the DBLINKS segment
function keggCompoundDblinks(text) {
  let result = new Object();
  let data = text.split(/\n/);
  data.forEach(d => {
    let split = d.split(/: /);
    result[split[0]] = split[1];
  });
  return result;
};

// Helper function to switch to the corresponding handler, if any
function keggCompoundDataSwitch(key, text) {
  switch (key) {
    case "dblinks": return keggCompoundDblinks(text);
    case "entry": return keggCompoundEntry(text);
    case "module": return keggCompoundModule(text);
    case "name": return keggCompoundName(text);
    case "pathway": return keggCompoundPathway(text);
    case "reaction": return keggCompoundReaction(text);
    default: return text;
  };
};

// Helper function to save a stringified JSON
function saveJsonString(file) {
  let uc = encodeURIComponent(file.content);
  let hr = `data:application/json;charset=utf-8,${uc}`;
  let anchor = document.createElement("a");
  anchor.setAttribute("download", (file.name) ? file.name : "saveJsonString");
  anchor.setAttribute("href", hr);
  anchor.click();
  anchor.remove();
  return;
};
