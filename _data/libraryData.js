const Tabletop = require('tabletop')
const dotenv = require('dotenv')

module.exports = async function () {
    console.log('process.env = ', process.env.GOOGLE_SHEET_URL)
    let publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1L6pFNR2fB9451zNvaNzXW_tFJ2ko7YqvuD8qmNz0NWk/edit?usp=sharing';

    async function init() {
        return Tabletop.init({ key: publicSpreadsheetUrl,
                        }).then((data, tabletop) => {
                            return { 
                                siteData: data['Site Data'].elements,
                                books: data['Books'].elements,
                            }
                        })
    }

    return await init()
}