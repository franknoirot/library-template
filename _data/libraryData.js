
const Tabletop = require('tabletop')

module.exports = async function () {
    let publicSpreadsheetUrl = 'https://'+process.env.GOOGLE_SHEET_URL
    console.log('google sheet = ', publicSpreadsheetUrl)

    async function init() {
        return Tabletop.init({ key: 'https://'+publicSpreadsheetUrl,
                        }).then((data, tabletop) => {
                            const siteData = data['Site Data'].elements.map(strToBool)
                            let books = data['Books'].elements.map(strToBool)

                            if (siteData[0].ignoreArticlesInSort) {
                                function filterArticles(str) {
                                    return str.toLowerCase().replace(/^the |^an |^a /, '')
                                }

                                books = books.sort((bookA, bookB) => filterArticles(bookA.title) > filterArticles(bookB.title) ? 1 : -1)
                            }

                            return { 
                                siteData,
                                books,
                            }
                        })
    }

    return await init()
}

function strToBool(obj) {
    function swapStr(str) {
        if (str === 'FALSE') return false
        if (str === 'TRUE') return true
        else return str
    }
    const newObj = {}
    for (key of Object.keys(obj)) {
        newObj[key] = swapStr(obj[key])
    }
    return newObj
}