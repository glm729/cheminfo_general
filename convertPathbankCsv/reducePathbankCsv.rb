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
