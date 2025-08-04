import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', async () => {
  await ladeMeldungen()

  const form = document.getElementById('meldung-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const artikelname = document.getElementById('artikelname').value
    const restbestand = parseInt(document.getElementById('restbestand').value)
    const melder = document.getElementById('melder').value

    const { error } = await supabase.from('meldungen').insert([
      { artikelname, restbestand, melder }
    ])

    if (error) {
      alert('❌ Fehler beim Speichern der Meldung.')
      console.error(error)
      return
    }

    window.emailjs.send('service_635wmwu', 'template_yzgxwx6', {
      artikelname,
      restbestand,
      melder
    }).then(
      (response) => {
        console.log('✅ E-Mail versendet:', response.status, response.text)
      },
      (error) => {
        console.error('❌ E-Mail-Fehler:', error)
      }
    )

    form.reset()

    // Erfolgsbox anzeigen
    const feedback = document.getElementById('meldung-feedback')
    feedback.style.display = 'block'
    setTimeout(() => {
      feedback.style.display = 'none'
    }, 4000)

    await ladeMeldungen()
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
    console.error('❌ Fehler beim Laden:', error)
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
