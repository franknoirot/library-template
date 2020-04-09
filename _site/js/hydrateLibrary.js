console.log('hydrating!', Tabletop)

let publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1L6pFNR2fB9451zNvaNzXW_tFJ2ko7YqvuD8qmNz0NWk/edit?usp=sharing';

function init() {
    return Tabletop.init({ 
        key: publicSpreadsheetUrl,
        callback: getData,
    })
}

function getData(data, tabletop) { 
    buildPage(data)
 }

init()


function buildPage(data) {
    const libraryGrid = document.querySelector('.library-grid')
    const libraryData = {
        siteData: data['Site Data'].elements,
        books: data['Books'].elements,
    }

    console.log('data = ', data, libraryData, libraryGrid)

    for (book of libraryData.books.filter(book => book.show === 'TRUE')) {
        console.log(book)

        const cardFront = elt('div', { classes: ['book-cover'] }, 
            elt('img', { props: { src: '/img/books/'+book.coverImg } })
        )

        const cardBack = elt('div', { classes: ['book-back'] }, 
            elt('h2', {}, book.title),
            elt('p', {classes: ['subtitle']}, elt('em', {}, book.subtitle)),
            elt('p', {}, (!book.author && book.editor) ? `edited by ${ book.editor }` : `by ${ book.author }`)
        )


        const card = elt('article', { classes: ['book-card'] }, 
            cardFront,
            cardBack,
        )

        libraryGrid.appendChild(card)
    }
}

// Thanks Eloquent Javascript!
function elt(type, config = { props: {}, classes: [], styles: {}}, ...children) {
    let node = document.createElement(type);

    if (config.props) {
        for (key of Object.keys(config.props)) {
            node[key] = config.props[key]
        }
    }

    if (config.styles) {
        for (key of Object.keys(config.styles)) {
            node.style[key] = config.styles[key]
        }
    }

    if (config.classes) {
        for (classStr of config.classes) {
            node.classList.add(classStr)
        }
    }

    for (let child of children) {
        if (typeof child != "string" && child) node.appendChild(child);
        else node.appendChild(document.createTextNode(child));
        }
    return node;
  }