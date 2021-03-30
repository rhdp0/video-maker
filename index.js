const readline = require('readline-sync') // Dependecia responsável por capturar input do usuário
const robots = {
    text: require('./robots/text.js')
}

async function start() {
    const content = {
        maximumSentences: 7
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    await robots.text(content)

    // Busca o termo de busca
    function askAndReturnSearchTerm () {
        return readline.question('Type a Wikipedia search term: ')
    }

    // Adiciona o prefixo
    function askAndReturnPrefix() {
        const prefix = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefix)
        const selectedPrefixText = prefix[selectedPrefixIndex]

        return selectedPrefixText
    }
    console.log(JSON.stringify(content, null, 4))
}

start()