const readline = require('readline-sync') // Dependecia responsável por capturar input do usuário
const state = require('./state.js')

function robot() {
    const content = {
        maximumSentences: 7
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    state.save(content)

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
}

module.exports = robot