import { GithubUser } from "./github_user.js"

export class Favorites {
  constructor(main) {
    this.main = document.querySelector(main)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }
 
  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(value) {
    try {

      const userExists = this.entries.find(entry => entry.login === value)

      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }
 
      const user = await GithubUser.search(value)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.updateData()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
    this.entries = filteredEntries
    this.updateData()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(main) {
    super(main)

    this.tableBody = this.main.querySelector('table tbody')

    this.updateData()
    this.addUser()
  }

  addUser() {
    const addButton = this.main.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.main.querySelector('.search input')
      this.add(value)
    }
  }

  updateData() { 
    this.removeTR()
    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Ìmagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Deseja remover o usuário?')

        if(isOk) {
          this.delete(user)
        }
      }

      this.tableBody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td class="user">
        <img src="" alt="">
        <a href="" target="_blank">
          <p><</p>
          <span></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td>
        <button class="remove">Remover</button>
      </td>`
    return tr
  }

  removeTR() {
    this.tableBody.querySelectorAll('tr').forEach((tr) => { tr.remove() })
  }
}