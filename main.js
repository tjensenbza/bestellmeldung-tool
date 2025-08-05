import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('meldung-form')
  const feedback = document.getElementById('meldung-feedback')
  const adminPass = 'geheim' // 👈 dein Adminpasswort
  const passInput = document.getElementById('admin-passwort')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const artikelname = document.getElementById('artikelname').value
    const restbestand = parseInt(document.getElementById('restbestand').value)
    const melder = document.getElementById('melder').value

    const { error } = await supabase.from('meldungen').insert([
      {
        artikelname,
        restbestand,
        melder,
        status: 'Bedarf gemeldet',
        status_zeit: new Date().toISOString()
      }
    ])

    if (error) {
      alert('❌ Fehler beim Speichern')
      console.error(error)
      return
    }

    form.reset()
    feedback.style.display = 'block'
    setTimeout(() => feedback.style.display = 'none', 3000)
    ladeMeldungen()
  })

  ladeMeldungen()
})

async function ladeMeldungen() {
  const tbody = document.getElementById('meldungen-body')
  tbody.innerHTML = ''
  const passInput = document.getElementById('admin-passwort')
  const siebenTageZurueck = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('meldungen')
    .select('*')
    .order('erstellt_at', { ascending: false })

  if (error) {
    console.error('❌ Fehler beim Laden:', error)
    return
  }

  const sichtbare = data.filter(m =>
    !(m.status === 'geliefert gewechselt' && m.status_zeit < siebenTageZurueck)
  )

  sichtbare.forEach(m => {
    const row = document.createElement('tr')
    const statusDropdown = createStatusDropdown(m.id, m.status, passInput.value.trim())
    row.innerHTML = `
      <td>${m.artikelname}</td>
      <td>${m.restbestand}</td>
      <td>${m.melder}</td>
      <td></td>
    `
    tbody.appendChild(row)
    row.querySelector('td:last-child').appendChild(statusDropdown)
  })
}

function createStatusDropdown(id, currentStatus, password) {
  const select = document.createElement('select')
  const statusOptionen = [
    'Bedarf gemeldet',
    'angefragt beim Lieferanten',
    'bestellt',
    'geliefert gewechselt'
  ]

  statusOptionen.forEach(status => {
    const option = document.createElement('option')
    option.value = status
    option.textContent = status
    if (status === currentStatus) option.selected = true
    select.appendChild(option)
  })

  select.addEventListener('change', async () => {
    if (password !== 'geheim') {
      alert('❌ Falsches Passwort – Änderung nicht erlaubt')
      select.value = currentStatus
      return
    }

    const neuerStatus = select.value

    const { error } = await supabase.from('meldungen')
      .update({ status: neuerStatus, status_zeit: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      alert('❌ Fehler beim Aktualisieren des Status')
      console.error(error)
      select.value = currentStatus
    } else {
      console.log('✅ Status aktualisiert:', neuerStatus)
    }
  })

  return select
}
