import { supabase } from './supabaseClient.js'

const form = document.getElementById('meldungForm')
const feedback = document.getElementById('feedback')

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
  }
})
