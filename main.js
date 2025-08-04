import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('meldung-form')
  const feedback = document.getElementById('meldung-feedback')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const artikelname = document.getElementById('artikelname').value
    const restbestand = parseInt(document.getElementById('restbestand').value)
    const melder = document.getElementById('melder').value

    const { error } = await supabase.from('meldungen').insert([
      { artikelname, restbestand, melder }
    ])

    if (error) {
      alert('❌ Fehler beim Speichern')
      return
    }

    window.emailjs.send('service_635wmwu', 'template_yzgxwx6', {
      artikelname,
      restbestand,
      melder
    }).then(
      () => console.log("✅ E-Mail versendet"),
      (error) => console.error("❌ E-Mail-Fehler:", error)
    )

    form.reset()
    feedback.style.display = 'block'
    setTimeout(() => feedback.style.display = 'none', 4000)
    ladeMeldungen()
  })

  ladeMeldungen()
})

async function ladeMeldungen() {
  const body = document.getElementById('meldungen-body')
  body.innerHTML = ''
  const { data, error } = await supabase.from('meldungen').select('*').order('erstellt_at', { ascending: false })
  if (error) return

  data.forEach((m) => {
    const row = document.createElement('tr')
    row.innerHTML = `<td>${m.artikelname}</td><td>${m.restbestand}</td><td>${m.melder}</td><td>${m.status ?? '-'}</td>`
    body.appendChild(row)
  })
}
