const fuseOptions = {
    includeScore: true,
    keys: [
        { name: 'title', weight: .5 }, 
        { name: 'subtitle', weight: .2 },
        { name: 'author', weight: .3 },
    ]
}

// Nunjucks puts in html entities instead of real quote characters. 
const books = JSON.parse(Window.libraryBooks.replace(/&quot;/g, '"'))
const themes= JSON.parse(Window.themes.replace(/&quot;/g, '"'))

console.log('themes = ', themes)

// Fuse.js is imported as a script tag. It is a small library that provides fuzzy search
// const fuse = new Fuse(books, fuseOptions)

// preprocess books, saving initial array position and whatnot before Vue scrambles things:
books.forEach((book, i) => {
    book.initialOrder = i
    isFlipped = false
})

const bookElements = Array.from(document.querySelectorAll('.book-card'))

bookElements.forEach(book => book.addEventListener('click', function(e) { this.classList.toggle('flipped') }))


// theme switcher
const themeRadios = Array.from(document.querySelectorAll('.theme-picker input'))
themeRadios.forEach((radio, i) => radio.addEventListener('input', () => processTheme(themes[i])))

function processTheme(themeObj) {
    if (!themeObj._processed) {
        themeObj._processed = true
        
        // add new fonts to the document from Google Fonts
        const fonts = [themeObj.headingFont, themeObj.bodyFont]
        const linkElem = document.createElement("link")
        linkElem.rel = 'stylesheet'
        linkElem.href = `https://fonts.googleapis.com/css2${ fonts.map((font, i) => ((i === 0) ? '?' : '&') +"family="+ font.replace(' ', '+')).join('') }`
        document.body.appendChild(linkElem)
    }
    
    Object.keys(themeObj)
        .filter(key => !key.includes('_'))
        .map(key => document.body.style.setProperty(`--${ key }`,
            (key.toLowerCase().includes('font')) ? `'${themeObj[key]}'` : themeObj[key]))
    
    console.log('new theme!', themeObj)
}

// new Vue({
//     //this targets the div id app
//     el: '#library',
//     data: {
//         fuzzy: '', // fuzzy search term
//         sort: {
//             attr: 'title',
//             order: 'desc',
//         },
//         sortAttrs: [
//             'title',
//             'author',
//             'pages',
//             'publishDate',
//         ],
//         filters: [
//             { attr: 'read', state: 0 }, // -1 means Not Read, 0 means Off, 1 means Read
//             { attr: 'borrowed', state: 0 }
//         ],
//         books: books,
//     }, 
//     computed: {
//         sortedBooks: this.fuzzy ? fuse.search(this.fuzzy) : books,
//     }
// })