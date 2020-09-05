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
console.log(Window.libraryBooks.replace(/&quot;/g, '"').split("\n"))
const books = JSON.parse(Window.libraryBooks.replace(/&quot;/g, '"'))
const themes= JSON.parse(Window.themes.replace(/&quot;/g, '"'))

console.log(window.location)

const params = new URLSearchParams(document.location.search.slice(1))
const findParam = p => (params) ? params.get(p) : undefined

let filters = []
let lastSearch = books

const booksDOM = Array.from(document.querySelectorAll('.book-group'))
books.forEach((book, i) => { book.elem = booksDOM[i] })

// theme switcher
let currTheme = themes[0]
const themeRadios = Array.from(document.querySelectorAll('.theme-picker input'))
themeRadios.forEach((radio, i) => radio.addEventListener('input', () => {
    currTheme = applyTheme(themes[i], i)
}))

if (findParam('t')) {
    const themeIndex = findParam('t')[1]
    currTheme = applyTheme(themes[themeIndex], themeIndex)
}

// Fuse.js is imported as a script tag. It is a small library that provides fuzzy search
const fuse = new Fuse(books, fuseOptions)
const searchBar = document.getElementById('search-input')
const resultCounter = document.getElementById('result-count')
searchBar.addEventListener('input', ({ target: { value }}) => {
    updateResults('search', value, currTheme)
    params.set('s', value)
})

if (findParam('s')) {
    updateResults('search', findParam('s')[1], currTheme)
}

function applyTheme(themeObj, themeIndex) {
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

    params.set('t', themeIndex)
    return themeObj
}

// Filter state logic
const comparisons = [
    {short: '<', label: 'is less than', fn: (a, b) => (a && a !== null) && ((typeof a === 'string') ? a < b : a < parseInt(b)) },
    {short: '>', label: 'is greater than', fn: (a, b) =>  (a && a !== null) && ((typeof a === 'string') ? a > b : a > parseInt(b)) },
    {short: '=', label: 'is equal to', fn: (a, b) =>  (a && a !== null) && ((typeof a === 'string') ? a === b : a === parseInt(b)) },
    {short: 'contains', label: 'contains', fn: (a, b) => (a && a !== null) && (a.toString().includes(b.toString())) },
    {short: "doesn't contain", label: "doesn't contain", fn: (a, b) => (a && a !== null) && (!a.toString().includes(b.toString())) },
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

const toggles = Array.from(document.querySelectorAll('.toggle'))
toggles.forEach((toggle, i, toggleArr) => toggle.addEventListener('click', function() {
    this.classList.toggle('active')
    toggleArr.filter(t => t !== toggle).forEach(t => t.classList.remove('active'))
    if (this.classList.contains('active')) {
        this.nextElementSibling.children[0].focus()
    }
}))

const filterValInput = document.getElementById('filter-val-input')

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

const filterTagsContainer = document.getElementById('filter-tags-container')
const noFiltersStatus = document.getElementById('no-filters')
function filterTag (filter) {
    const el = document.createElement('button')
    el.id = filter.uid
    el.classList.add('tag')
    el. innerText = `${ filter.prop } ${ filter.comparison.short } "${ filter.value }"`
    filterTagsContainer.appendChild(el)
    el.addEventListener('click', function(e) {
        const foundIndex = filters.findIndex(filter => filter.uid === this.id)
        filters = [
            ...filters.slice(0, foundIndex),
            ...filters.slice(foundIndex + 1, filters.length),
        ]
        filterTagsContainer.removeChild(this)
        updateResults('filter', undefined, currTheme)

        if (filters.length === 0) {
            filterTagsContainer.appendChild(noFiltersStatus)
        }
    })

    return el
}

const filterAddForm = document.getElementById('filter-add-form')
const toggleInners = Array.from(document.querySelectorAll('.toggle + *'))
toggleInners.forEach(inner => {
    Array.from(inner.children).map(el => {
        if (!el.tabindex && !(el.tagName === 'A' && el.href) && !(['input', 'select', 'checkbox', 'textarea'].some(tag => tag.toUpperCase() === el.tagName) && !el.disabled)) {
            el.addEventListener('keydown', e => {
                if (e.keyCode === 27) {
                    toggle.previousElementSibling.click()
                }
            })
        }
    })
})

function newFilter () {
    return {
        uid: Math.random().toString(36).slice(2,9),
        label: filterParamDOM.value,
        prop: filterParams.find(f => f.prop === filterParamDOM.value).prop,
        comparison: comparisons[filterCompDOM.value],
        value: filterValInput.value,
    }
}

function addFilter(e) {
    e.preventDefault()

    const filter = newFilter()
    filter.dom = filterTag(filter)

    filters = [
        filter,
        ...filters,
    ]

    if (filters.length === 1) {
        filterTagsContainer.removeChild(noFiltersStatus)
    }

    updateResults('filter', undefined, currTheme)
    filterAddForm.children[0].focus()
}

function filterResults(results, filters, propHooks) {
    return (!filters || !filters.length)
        ? results
        : results.filter(result => filters.every(filter => {
            const foundHook = propHooks.find(h => h.prop === filter.prop)
            const sendVal = ((hook) => (val) => (hook) ? hook.hook(val) : val)(foundHook)

            return filter.comparison.fn(sendVal(result[filter.prop]), sendVal(filter.value)) 
        }))
}

function updateResults(type, val, theme) { 
    let searchResults = lastSearch
    if (type === 'search') {
        // do a new search
        searchResults = (val && val !== null) ? fuse.search(val).map(res => res.item) : books
        lastSearch = searchResults
    }

    const filteredResults = filterResults(searchResults, filters,
        (theme.ignoreArticlesInSort) ? [{ prop: 'title', hook: t => t.toLowerCase().replace(/^the |^an |^a /, '') }] : [])
    
    booksDOM.forEach(b => b.classList.add('hidden'))
    resultCounter.innerText = filteredResults.length + ' book' + ((filteredResults.length > 1) ? 's' : '')
    filteredResults.forEach(b => b.elem.classList.remove('hidden'))
}

filterAddForm.addEventListener('submit', addFilter)
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

// URL update function
function updateURLParams(state) {
    Object.keys(state).map(key => params.set(key, state[key].toString()))
}