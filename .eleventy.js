
require('dotenv').config();
const fs = require("fs");
const Image = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function(eleventyConfig) {
  eleventyConfig.addNunjucksFilter("findObjByKeyVal", function (arr, key, val) {
    console.log(key, val)
    return arr.find(obj => obj[key] === val)
  })

  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addNunjucksShortcode("imageSync", imageShortcodeSync)

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: true,
    permalinkClass: "direct-link",
    permalinkSymbol: "#"
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Browsersync Overrides
//   eleventyConfig.setBrowserSyncConfig({
//     callbacks: {
//       ready: function(err, browserSync) {
//         const content_404 = fs.readFileSync('_site/404.html');

//         browserSync.addMiddleware("*", (req, res) => {
//           // Provides the 404 content without redirect.
//           res.write(content_404);
//           res.end();
//         });
//       },
//     },
//     ui: false,
//     ghostMode: false
//   });

  return {
    templateFormats: [
      "md",
      "njk",
      "liquid"
    ],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about those.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.io/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`
    // pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    // These are all optional, defaults are shown:
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};

async function imageShortcode(src, alt, sizes) {
  let metadata = await Image(src, {
    widths: [300, 600, 960],
    formats: ["webp", "jpeg"],
    outputDir: "./_site/img/",
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
}

function imageShortcodeSync(src, cls, alt, sizes, widths) {
  let options = {
    widths: widths || [300, 600, 960],
    formats: ['webp', 'jpeg'],
    outputDir: "./_site/img",
  };

  // generate images, while this is async we don’t wait
  Image(src, options);

  let imageAttributes = {
    class: cls,
    alt,
    sizes: sizes || "(min-width: 20vw) 35vw, 50vw",
    loading: "lazy",
    decoding: "async",
  };
  // get metadata even the images are not fully generated
  metadata = Image.statsSync(src, options);
  return Image.generateHTML(metadata, imageAttributes);
}
