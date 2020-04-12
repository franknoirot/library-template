const fs = require("fs");
require('dotenv').config();
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("img");

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