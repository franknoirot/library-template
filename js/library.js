const books = JSON.parse(Window.libraryBooks.replace(/&quot;/g, '"'))

// const bookElements = Array.from(document.querySelectorAll('.book-card'))

// bookElements.forEach(book => book.addEventListener('click', function(e) { this.classList.toggle('flipped') }))

new Vue({
    //this targets the div id app
    el: '#library',
    data: {
        fuzzy: '', // fuzzy search term
        isFlipped: Array.of(books.length).fill(false),
        books: books,
    }
})