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

// Fuse.js is imported as a script tag. It is a small library that provides fuzzy search
const fuse = new Fuse(books, fuseOptions)

// preprocess books, saving initial array position and whatnot before Vue scrambles things:
books.forEach((book, i) => {
    book.initialOrder = i
    isFlipped = false
})

// const bookElements = Array.from(document.querySelectorAll('.book-card'))

// bookElements.forEach(book => book.addEventListener('click', function(e) { this.classList.toggle('flipped') }))

new Vue({
    //this targets the div id app
    el: '#library',
    data: {
        fuzzy: '', // fuzzy search term
        sort: {
            attr: 'title',
            order: 'desc',
        },
        sortAttrs: [
            'title',
            'author',
            'pages',
            'publishDate',
        ],
        filters: [
            { attr: 'read', state: 0 }, // -1 means Not Read, 0 means Off, 1 means Read
            { attr: 'borrowed', state: 0 }
        ],
        books: books,
    }, 
    computed: {
        sortedBooks: this.fuzzy ? fuse.search(this.fuzzy) : books,
    }
})