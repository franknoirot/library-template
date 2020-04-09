const Tabletop = require('tabletop')

module.exports = async function () {
    let publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1L6pFNR2fB9451zNvaNzXW_tFJ2ko7YqvuD8qmNz0NWk/edit?usp=sharing';

    async function init() {
        return Tabletop.init({ key: publicSpreadsheetUrl,
                        }).then((data, tabletop) => {
                            console.log('got the data!', data['Personal Collection'].elements)
                            return data['Personal Collection'].elements
                        })
    }

    return await init()
}