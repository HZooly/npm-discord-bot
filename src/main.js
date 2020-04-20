const got = require('got')
require('dotenv').config()
const { Client, MessageEmbed } = require('discord.js')
const client = new Client()

const PREFIX = process.env.PREFIX
const SEARCH_COMMAND = `${PREFIX}npm`

const buildFields = (package) => {
  const fields = []
  if (package) {
    if (package.links) {
      if (package.links.npm) {
        fields.push(`[NPM](${package.links.npm})`)
      }
      if (package.links.repository) {
        fields.push(`[sources](${package.links.repository})`)
      }
    }
  }
  return fields.join(' - ')
}

client.on('ready', () => {
  client.user.setActivity(`${SEARCH_COMMAND} for searching...`, { type: 'LISTENING' })
})

client.on('message', async (message) => {
  if (message.author.bot) return

  const content = message.content
  if (content.indexOf(`${SEARCH_COMMAND}`) > -1) {
    const search = content.slice(SEARCH_COMMAND.length).trim()
    try {
      const data = await got(`https://api.npms.io/v2/search?q=${search}&size=5`).json()
      const fields = data.results
      const embed = new MessageEmbed()
        .setTitle(`Top ${fields.length} for NPM search`)
        .setDescription(`**Search**: _"${search}"_ - [see all results](https://www.npmjs.com/search?q=${search})`)
        .setColor('#EA2039')

      fields.forEach(field => {
        embed.addField(`**${field.package.name}** (${field.package.version})`, `${field.package.description}\n${buildFields(field.package)}`)
      })
      message.channel.send({embed})
    } catch (err) {
      console.error(err)
    }
  }
})

client.login(process.env.DISCORD_TOKEN)
