import fs from "fs";

const prettier = require("prettier");

const libs = require("./libs");
const markdown = require("./markdown");

const directory = process.argv[2] || "in";

console.log("DirectoryInit: Attempting to delete 'out' directory...");
libs.forceRecursiveDelete("out");

console.log(
  "DirectoryInit: Attempting to clone '" + directory + "' to 'out' directory..."
);

libs.cloneDirectory(directory, "out");

console.log("DirectoryInit: Checking for a template file...");

if (!fs.existsSync("out/template.html")) {
  console.log(
    "DirectoryInit: No template file found. Attempting to create one..."
  );
  fs.writeFileSync(
    "out/template.html",
    "<!DOCTYPE html>\n\n<span>No template specified! Please be sure to make one by making a 'template.html' file.</span>\n<br>Follow this example on how to make one.</span>\n<br><br>\n<md></md>"
  );
}

console.log("DirectoryInit: Reading template file...");
const template = fs.readFileSync("out/template.html", "utf8");

console.log(
  "Convert: (REMINDER) If you are planning to use code highlighting, you must add a 'highlight.js' theme css file to the 'template.html' file."
);

console.log("TableGen: Checking if there are any table of content files...");

for (i of libs.recursiveGetDirectories("out")) {
  if (i.endsWith("toc.gen")) {
    console.log("TableGen: Found a request to make a table of content file.");
    console.log("TableGen: Deleting generation files...");

    const tocOriginal = i;

    libs.forceRecursiveDelete(i);
    libs.forceRecursiveDelete(i.replace("toc.gen", "toc.md"));

    console.log("TableGen: Getting directory list...");
    const dirList = libs.recursiveGetDirectories(
      i.replace("/toc.gen", "").replace("\\toc.gen", "").replace("toc.gen", "")
    );

    let toc = "# Table of Contents\n\n- [Table of Contents](toc.html)\n";

    console.log("TableGen: Generating table of contents...");

    for (j of dirList) {
      if (j.endsWith(".md")) {
        console.log("TableGen: Found '" + j + "'.");
        const file = fs.readFileSync(j, "utf8");

        const title = file
          .split("\n")[0]
          .replace("### ", "")
          .replace("## ", "")
          .replace("# ", "")
          .replace("###", "")
          .replace("##", "")
          .replace("#", "");

        let link = tocOriginal;
        
        link = link.replace("\\toc.gen", "").replace("/toc.gen", ""); // Makes a filter
        link = j.replace(link, ""); // Removes the path
        link = link.replace(".md", ".html"); // Replaces the extension
        link = link.replace("\\", "/"); // Replaces the backslash with a forward slash
        link = link.replace("/", ""); // Remove the first forward slash
        
        toc += "- [" + title + "](" + link + ")\n";
      }
    }

    console.log("TableGen: Writing table of contents file...");

    fs.writeFileSync(
      tocOriginal.replace("toc.gen", "toc.md"),
      prettier.format(toc, { parser: "markdown" })
    );

    console.log("TableGen: Done with table of contents file.");
  }
}

const files = libs.recursiveGetDirectories("out");

for (i of files) {
  if (i.endsWith(".md")) {
    console.log("Convert: Attempting to convert '" + i + "' to HTML...");
    const file = fs.readFileSync(i, "utf8");

    const html = markdown.render(file);
    console.log("Convert: Building template...");
    let newHTML = template.replaceAll("<md>", html).replaceAll("</md>", "");

    console.log("Convert: Running post-processing (prettier)...");

    newHTML = prettier.format(newHTML, {
      parser: "html",
    });

    console.log("Convert: Writing '" + i + "'...");
    fs.writeFileSync(i.replace(".md", ".html"), newHTML);

    console.log("Convert: Deleting '" + i + "'...");
    fs.rmSync(i);
  }
}

console.log("DirectoryInit: Cleaning up...");
fs.rmSync("out/template.html");

console.log("DirectoryInit: Done!");
