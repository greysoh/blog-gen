const fs = require('fs');
const path = require('path');

module.exports = {
  /**
   * This function recursively searches all directories.
   * @param {String} src The directory to search.
   * @returns {Array} An array of all files in the directory.
   */
  recursiveGetDirectories(src) {
    const dirList = fs.readdirSync(src);
    let dirs = [src];

    for (i of dirList) {
      const fixedDir = path.join(src, i);
      const isDir = fs.statSync(fixedDir).isDirectory();

      if (isDir) {
        const listDirs = recursiveGetDirectories(fixedDir);

        for (j of listDirs) {
          dirs.push(j);
        }
      } else {
        dirs.push(fixedDir);
      }
    }

    return dirs;
  },

  /**
   * Copies directory contents to a new directory.
   * @param {string} srcDir Source directory to clone.
   * @param {string} destDir Destination directory to clone to.
   */
  cloneDirectory(srcDir, destDir) {
    const dirList = fs.readdirSync(srcDir);

    try {
      fs.mkdirSync(destDir);
    } catch (e) {
      console.warn("WARN: " + destDir + " already exists.");
    }

    for (i of dirList) {
      const fixedDir = path.join(srcDir, i);
      const isDir = fs.statSync(fixedDir).isDirectory();

      if (isDir) {
        const newDir = path.join(destDir, i);
        fs.mkdirSync(newDir);
        cloneDirectory(fixedDir, newDir);
      } else {
        const newFile = path.join(destDir, i);
        fs.copyFileSync(fixedDir, newFile);
      }
    }
  },

  /**
   * Deletes a directory and all of its contents, without throwing errors.
   * @param {string} src Source directory to delete.
   */
  forceRecursiveDelete(src) {
    if (!fs.existsSync(src)) {
      return;
    }

    fs.rmSync(src, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
        return err;
      }
    });
  },
};
