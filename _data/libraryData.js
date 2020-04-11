const Tabletop = require('tabletop')

module.exports = async function () {
    let publicSpreadsheetUrl = process.env.GOOGLE_SHEET_URL

    async function init() {
        return Tabletop.init({ key: 'https://'+publicSpreadsheetUrl,
                        }).then((data, tabletop) => {
                            return { 
                                siteData: data['Site Data'].elements,
                                books: data['Books'].elements,
                            }
                        })
    }

    return await init()
}