const bookElements = Array.from(document.querySelectorAll('.book-card'))

bookElements.forEach(book => book.addEventListener('click', function(e) { this.classList.toggle('flipped') }))