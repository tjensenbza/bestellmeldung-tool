import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  await ladeMeldungen()

  const form = document.getElementById('meldung-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const artikelname = document.getElementById('artikelname').value
    const restbestand = parseInt(document.getElementById('restbestand').value)
    const melder = document.getElementById('melder').value

    // Speichern in Supabase
    const { error } = await supabase.from('meldungen').insert([
      { artikelname, restbestand, melder }
    ])

    if (error) {
      alert('❌ Fehler beim Speichern der Meldung.')
      console.error(error)
      return
    }

    // E-Mail senden
    window.emailjs.send('service_635wmwu', 'template_yzgxwx6', {
      artikelname: artikelname,
      restbestand: restbestand,
      melder: melder
    }).then(
      function (response) {
        console.log("✅ E-Mail versendet:", response.status, response.text)
      },
      function (error) {
        console.error("❌ E-Mail-Fehler:", error)
        alert("Fehler beim E-Mail-Versand: " + JSON.stringify(error))
      }
    )

    // Formular leeren
    form.reset()

    // Neue Zeile direkt anzeigen
    const tableBody = document.getElementById('meldungen-body')
    const newRow = document.createElement('tr')
    newRow.innerHTML = `
      <td>${artikelname}</td>
      <td>${restbestand}</td>
      <td>${melder}</td>
      <td><span class="badge">Bedarf gemeldet</span></td>
    `
    tableBody.prepend(newRow)

    // Erfolgsbox anzeigen
    const feedback = document.getElementById('meldung-feedback')
    feedback.style.display = 'block'
    setTimeout(() => {
      feedback.style.display = 'none'
    }, 4000)

    // Daten vorsichtshalber synchronisieren
    setTimeout(ladeMeldungen, 1000)
  })
})

async function ladeMeldungen() {
  const tableBody = document.getElementById('meldungen-body')
  tableBody.innerHTML = ''

  const { data, error } = await supabase
    .from('meldungen')
    .select('*')
    .order('erstellt_at', { ascending: false })

  if (error) {
    console.error('❌ Fehler beim Laden der Daten:', error)
    return
  }

  data.forEach((meldung) => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${meldung.artikelname}</td>
      <td>${meldung.restbestand}</td>
      <td>${meldung.melder}</td>
      <td><span class="badge">${meldung.status ?? '–'}</span></td>
    `
    tableBody.appendChild(row)
  })
}
