export default class Logger {
  name!: string

  constructor(name: string) {
    this.name = name
  }

  log(type: string, message: string) {
    const now = new Date()
    const date = now.getDate().toString().padStart(2, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()
    const hour = now.getHours().toString().padStart(2, '0')
    const minute = now.getMinutes().toString().padStart(2, '0')
    const second = now.getSeconds().toString().padStart(2, '0')
    const millisecond = now.getMilliseconds().toString().padStart(3, '0')
    const dateTimeStr = `${date}/${month}/${year} ${hour}:${minute}:${second}.${millisecond}`
    console.log(`[${dateTimeStr}] [${this.name}] [${type}]: ${message}`)
  }

  info(message: string) {
    this.log('INFO', message)
  }

  error(message: string) {
    this.log('ERROR', message)
  }
}