const { Client, GatewayIntentBits } = require("discord.js")
require("dotenv").config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.once("ready", () => {
  console.log("Discord To-Do Bot is online!")
})

const toDoList = {}

function updateIds(userTodos) {
  userTodos.forEach((todo, index) => {
    todo.id = index + 1
  })
}

client.on("messageCreate", (message) => {
  if (message.content.startsWith("!todo")) {
    const args = message.content.slice(5).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    switch (command) {
      case "add": {
        const task = args[0]
        const description = args.slice(1).join(" ")
        if (!toDoList[message.author.id]) {
          toDoList[message.author.id] = []
        }
        const id = toDoList[message.author.id].length + 1
        toDoList[message.author.id].push({ id, task, description })
        message.channel.send(`Added todo "${task}" with ID ${id}`)
        break
      }
      case "list": {
        if (
          !toDoList[message.author.id] ||
          toDoList[message.author.id].length === 0
        ) {
          message.channel.send("Your to-do list is currently empty.")
        } else {
          const list = toDoList[message.author.id]
            .map((todo) => `${todo.id}. ${todo.task}`)
            .join("\n")
          message.channel.send(`To-do Lists\n${list}`)
        }
        break
      }
      case "delete": {
        if (!toDoList[message.author.id]) {
          message.channel.send("Your to-do list is empty.")
          break
        }
        const idToDelete = parseInt(args[0])
        if (toDoList[message.author.id].length >= idToDelete) {
          toDoList[message.author.id].splice(idToDelete - 1, 1)
          updateIds(toDoList[message.author.id])
          message.channel.send(`Deleted todo with ID ${idToDelete}`)
        } else {
          message.channel.send("Could not find a todo with that ID.")
        }
        break
      }
      case "edit": {
        const idToEdit = parseInt(args[0])
        if (idToEdit <= toDoList[message.author.id].length) {
          const newTask = args[1]
          const newDescription = args.slice(2).join(" ")
          const todo = toDoList[message.author.id][idToEdit - 1]
          todo.task = newTask
          todo.description = newDescription
          message.channel.send(`Updated todo with ID ${idToEdit}`)
        } else {
          message.channel.send("Could not find a todo with that ID.")
        }
        break
      }
      case "view": {
        const idToView = parseInt(args[0])
        if (idToView <= toDoList[message.author.id].length) {
          const todo = toDoList[message.author.id][idToView - 1]
          message.channel.send(
            `ID -${todo.id}\nTask - ${todo.task}\nDescription - ${todo.description}`
          )
        } else {
          message.channel.send("Could not find a todo with that ID.")
        }
        break
      }
      case "help":
        message.channel.send(`
**To-Do Bot Commands:**
- \`!todo add [task] [description]\` - Adds a new to-do with the given task and description.
- \`!todo list\` - Lists all your current to-dos with their ID and task name.
- \`!todo delete [id]\` - Deletes the to-do with the specified ID.
- \`!todo edit [id] [new task] [new description]\` - Edits the task and description of the to-do with the specified ID.
- \`!todo view [id]\` - Shows the task and description of the to-do with the specified ID.
- \`!todo help\` - Shows this list of commands.

Replace [id] with the actual ID of the to-do, [task] with the name of your task, and [description] with the full description of your to-do.
`)
        break
      default:
        message.channel.send(
          "Unknown command. Use `!todo help` to list all available commands."
        )
    }
  }
})

client.login(process.env.DISCORD_TOKEN)
