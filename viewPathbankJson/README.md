# View PathBank JSON
#### Mr. George L. Malone
#### 18<sup>th</sup> of March, 2021


The contents of this directory permit viewing of data held within the PathBank
JSON in a nicer format (within a ChemInfo view).  This is mainly because of the
potentially arbitrary length of the pathways data, which must be handled
differently to other data (which I have labelled "main") to preserve context,
that is, to preserve the links between pathway ID, name, and subject.  The user
can search by metabolite name or SMILES code.  Clicking a row displays detailed
data of the current metabolite.

The functionality within this directory is also incorporated into
[glm729/sciiLitJson](https://github.com/glm729/sciiLitJson).

The cell to read, parse, and save the input data is excluded, as it is
literally two lines:

```javascript
let parsed = JSON.parse(API.getData("jsonUpload").resurrect());
API.createData("dataTable", parsed);
```

![Screenshot of PathBank JSON viewer](demoMain2.png "Screenshot of PathBank
JSON viewer")
