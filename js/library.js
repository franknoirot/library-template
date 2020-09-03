// if this is running, show the elements that rely on JS
Array.from(document.querySelectorAll('.js-deactivated')).forEach(elem => elem.classList.remove('js-deactivated'))

const fuseOptions = {
    includeScore: true,
    threshold: .4,
    keys: [
        { name: 'title', weight: .5 }, 
        { name: 'subtitle', weight: .2 },
        { name: 'author', weight: .3 },
    ]
}

// Nunjucks puts in html entities instead of real quote characters. 
const books = JSON.parse(Window.libraryBooks.replace(/&quot;/g, '"'))
const themes= JSON.parse(Window.themes.replace(/&quot;/g, '"'))

const booksDOM = Array.from(document.querySelectorAll('.book-group'))
books.forEach((book, i) => { book.elem = booksDOM[i] })


// Fuse.js is imported as a script tag. It is a small library that provides fuzzy search
const fuse = new Fuse(books, fuseOptions)
const searchBar = document.getElementById('search-input')
const resultCounter = document.getElementById('result-count')
searchBar.addEventListener('input', function(e) {
    if (!this.value || this.value === '') {
        booksDOM.forEach(b => b.classList.remove('hidden'))
        resultCounter.innerText = books.length + ' book' + ((books.length > 1) ? 's' : '')
        return
    }
    booksDOM.forEach(b => b.classList.add('hidden'))
    const bookResults = fuse.search(this.value)
    
    console.log('results', bookResults)
    
    resultCounter.innerText = bookResults.length + ' book' + ((books.length > 1) ? 's' : '')
    bookResults.forEach(b => b.item.elem.classList.remove('hidden'))
})

// preprocess books, saving initial array position and whatnot before Vue scrambles things:
books.forEach((book, i) => {
    book.initialOrder = i
    isFlipped = false
})

// theme switcher
const themeRadios = Array.from(document.querySelectorAll('.theme-picker input'))
themeRadios.forEach((radio, i) => radio.addEventListener('input', () => applyTheme(themes[i])))

function applyTheme(themeObj) {
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
}

// Filter state logic
const comparisons = [
    {label: 'Less than', fn: (a, b) => a < b },
    {label: 'Greater than', fn: (a, b) => a < b },
    {label: 'Contains', fn: (a, b) => a.toString().includes(b.toString()) },
    {label: "Doesn't contain", fn: (a, b) => !a.toString().includes(b.toString()) },
]
function camelToTitleCase(str) {
    return str.slice(0,1).toUpperCase() + str.slice(1).replace(/[A-Z]/g, (s) => ' '+s.toUpperCase())
}

const filterParams = themes[0].filterFields.split(',').map(filter => {
    return {
        label: camelToTitleCase(filter.trim()),
        prop: filter.trim(),
    }
})
console.log('filters = ', filterParams)
const filterParamDOM = document.getElementById('filter-param-dropdown')
filterParams.forEach((param, i) => {
    const el = document.createElement("option")
    el.value = filterParams[i].prop
    el.innerText = filterParams[i].label
    filterParamDOM.appendChild(el)
})

const filterCompDOM = document.getElementById('filter-comp-dropdown')
comparisons.forEach((comp, i) => {
    const el = document.createElement("option")
    el.value = i
    el.innerText = comp.label
    filterCompDOM.appendChild(el)
})

const filters = []
function addFilter(e) {
    filters = [
        {
            label: filterParamDOM.innerText,
            
        },
        ...filters,
    ]
}

// end Filters


// top nav scroll listener
const navbar = document.querySelector('.top-navbar')
let lastScrollY = 0
window.addEventListener('scroll', function() {
    if (window.scrollY > 0 && lastScrollY === 0) {
        navbar.classList.add('stuck')
    } else if (window.scrollY === 0) {
        navbar.classList.remove('stuck')
    }
    lastScrollY = window.scrollY
}, { passive: true })