import { supabase } from './supabaseClient.js'

const form = document.getElementById('meldungForm')
const feedback = document.getElementById('feedback')
const table = document.getElementById('meldungsdaten')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const artikelname = document.getElementById('artikelname').value
  const restbestand = document.getElementById('restbestand').value
  const melder = document.getElementById('melder').value

  const { error } = await supabase.from('meldungen').insert([{ artikelname, restbestand, melder }])

  if (error) {
    feedback.textContent = 'Fehler: ' + error.message
    feedback.className = 'error'
  } else {
    feedback.textContent = 'Meldung erfolgreich gesendet!'
    feedback.className = 'success'
    form.reset()
    ladeMeldungen()
  }
})

async function ladeMeldungen() {
  table.innerHTML = '' // Tabelle leeren

  const { data, error } = await supabase
    .from('meldungen')
    .select('*')
    .order('erstellt_at', { ascending: false })

  if (error) {
    table.innerHTML = '<tr><td colspan="3">Fehler beim Laden</td></tr>'
    return
  }

  data.forEach(row => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${row.artikelname}</td>
      <td>${row.restbestand}</td>
      <td>${row.melder}</td>
    `
    table.appendChild(tr)
  })
}

// Direkt beim Laden Daten abrufen
ladeMeldungen()
