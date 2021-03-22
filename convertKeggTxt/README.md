# Convert KEGG Compound TXT to JSON
#### Mr. George L. Malone
#### 22<sup>nd</sup> of March, 2021


### Overview

The purpose of this document is to describe the operations required to reformat
KEGG Compound TXT data into JSON, but also describes extracting KEGG Compound
IDs from the PathBank JSON, and describes fetching and handling the data via
the ChemInfo proxy.


### Background / Rationale

The operations performed were undertaken to support aggregation of metabolite
data from KEGG in addition to PathBank where, in this circumstance, the data
intersect (that is, are featured in both PathBank and KEGG Compound).
Collecting data from KEGG in addition to PathBank permits combination of these
data under a unique identifier (SMILES code).


### Operations

There were two scripts used for the complete operations.  Extracting,
requesting, and saving KEGG Compound text data were handled by the script
`dataPerKeggid.js`.  Splitting and reformatting the text data, and saving the
result, were handled by the script `reformatKeggTxt.js`.


#### Extracting KEGG IDs from PathBank JSON

This component was relatively straightforward, and hinges on one function
definition.  The input is the parsed PathBank JSON, and the output is a sorted,
unique array of KEGG IDs found within the input.


#### Requesting KEGG Compound data

KEGG imposes a limit of 10 entries per request.  The data were split into
chunks of (up to) 10 IDs and the URIs were generated for these ID groups.  A
fetch promise was generated for each URI, with the resulting data returned.
Once all promises were settled, the data were concatenated in a string, and
saved as a text file.


#### Splitting and reformatting KEGG Compound data

The common separator used for each KEGG Compound entry is a triple forward
slash (`///`), so this was used to split the text file into its component
blocks, whereby each block relates to one Compound ID.  The blocks were split
by newline and filtered for empty strings, and the resulting object was
filtered for empty arrays.  This results in an array of strings for each KEGG
Compound ID.

Associating each string with a specific segment was relatively straightforward.
New segments can be identified by the start of the string, whereby a new
segment begins if the string does not start with whitespace characters.  If the
string begins with whitespace characters, the data are associated with the
"current" segment.  There are 17 unique segment names in the data, but not
every compound features every segment name.

Some segments are of particular interest, so these were handled specially.
Functions were written to reformat the segments of interest in a more
meaningful manner than leaving the data as a string.  Other segments were left
unmodified, mainly because I don't know at this stage how I should handle or
reformat them, or if they are of interest.

The resulting object was saved as a JSON file, which, with an indent level of
2 spaces, is approx. 4 MB.
