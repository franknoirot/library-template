const Tabletop = require('tabletop')

module.exports = async function () {
    let publicSpreadsheetUrl = process.env.GOOGLE_SHEET_URL

    async function init() {
        return Tabletop.init({ key: 'https://'+publicSpreadsheetUrl,
                        }).then((data, tabletop) => {
                            return { 
                                siteData: data['Site Data'].elements.map(strToBool),
                                books: data['Books'].elements.map(strToBool),
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