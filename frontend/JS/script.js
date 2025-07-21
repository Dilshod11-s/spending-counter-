const category = document.querySelector('#category')
const categoryOption = category.querySelector('option')
const transactionTemp = document.querySelector('.transaction')
const table = document.querySelector('#transaction-history')

const form = document.querySelector('.expense-form')
const categories = []

function updateSummary(spendings) {
  const totalExpenses = spendings.reduce((sum, s) => sum + Number(s.price), 0)
  const balance = totalExpenses

  document.getElementById('total-expenses').textContent = totalExpenses
  document.getElementById('balance').textContent = balance
}

// Загрузка категорий и расходов
fetch('http://localhost:3000/category')
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      const newCategory = categoryOption.cloneNode(true)
      newCategory.textContent = item.title
      newCategory.value = item.id

      category.appendChild(newCategory)
      categories.push(item)
    })

    return fetch('http://localhost:3000/spendings')
  })
  .then(res => res.json())
  .then(spendings => {
    spendings.forEach(spending => {
      const transaction = transactionTemp.cloneNode(true)
      transaction.classList.remove('hidden')

      const description = transaction.querySelector('.description')
      const categoryCell = transaction.querySelector('.category')
      const amount = transaction.querySelector('.amount')
      const deleteButton = transaction.querySelector('.delete')
      const editButton = transaction.querySelector('.edit')

      deleteButton.dataset.id = spending.id
      editButton.dataset.id = spending.id

      description.textContent = spending.description
      categoryCell.textContent =
        (categories.find(item => item.id == spending.category) || { title: 'Неизвестно' }).title
      amount.textContent = spending.price

      table.appendChild(transaction)
    })
    updateSummary(spendings)
  })

// Отправка формы
form.addEventListener('submit', e => {
  e.preventDefault()

  const id = form.id.value.trim()
  const body = {
    price: form.price.value,
    description: form.description.value,
    category: String(form.category.value)
  }

  const url = id
    ? `http://localhost:3000/spendings/${id}`
    : 'http://localhost:3000/spendings'

  const method = id ? 'PUT' : 'POST'

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(() => location.reload())
})

// Удаление и редактирование
table.addEventListener('click', e => {
  if (e.target.classList.contains('delete')) {
    const id = e.target.dataset.id
    const sure = confirm('Вы действительно хотите удалить расход?')
    if (sure) {
      fetch(`http://localhost:3000/spendings/${id}`, {
        method: 'DELETE'
      }).then(() => location.reload())
    }
  }

  if (e.target.classList.contains('edit')) {
    const id = e.target.dataset.id
    fetch(`http://localhost:3000/spendings/${id}`)
      .then(res => res.json())
      .then(data => {
        form.description.value = data.description
        form.category.value = data.category
        form.price.value = data.price
        form.id.value = data.id // важно: должен быть скрытый input
      })
  }
})
