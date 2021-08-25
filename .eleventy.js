
require('dotenv').config();
const fs = require("fs");
const path = require('path')
const Image = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function(eleventyConfig) {
  eleventyConfig.addNunjucksFilter("findObjByKeyVal", function (arr, key, val) {
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

async function imageShortcode(src, alt) {
  if (!alt) {
    throw new Error(`Missing \`alt\` on myImage from: ${src}`);
  }

  let stats = await Image(src, {
    widths: [640, 960, 1200],
    formats: ["jpeg", "webp"],
    outputDir: "./_site/img/",
  });

  let lowestSrc = stats["jpeg"][0];

  const srcset = Object.keys(stats).reduce(
    (acc, format) => ({
      ...acc,
      [format]: stats[format].reduce(
        (_acc, curr) => `${_acc} ${curr.srcset} ,`,
        ""
      ),
    }),
    {}
  );

  const source = `<source type="image/webp" srcset="${srcset["webp"]}" >`;

  const img = `<img
    loading="lazy"
    alt="${alt}"
    src="${lowestSrc.url}"
    sizes='(min-width: 1024px) 1024px, 100vw'
    srcset="${srcset["jpeg"]}"
    width="${lowestSrc.width}"
    height="${lowestSrc.height}">`;

  return `<picture> ${source} ${img} </picture>`;
}

function imageShortcodeSync(src, alt) {
  let options = {
    widths: [640, 960, 1200],
    formats: ["jpeg", "webp"],
    outputDir: "./_site/img/",
  }

  // generate images, while this is async we don’t wait
  Image(src, options);

  let imageAttributes = {
    alt,
    sizes: "(min-width: 1024px) 1024px, 100vw",
    loading: "lazy",
    decoding: "async",
  };
  // get metadata even the images are not fully generated
  metadata = Image.statsSync(src, options);
  return Image.generateHTML(metadata, imageAttributes);
}
