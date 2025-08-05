import { supabase } from './supabaseClient.js'

let adminFreigabe = false

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('meldung-form')
  const feedback = document.getElementById('meldung-feedback')

  // Adminfreigabe
  const adminLoginBtn = document.getElementById('admin-login-btn')
  adminLoginBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const pw = document.getElementById('admin-passwort').value.trim()
    if (pw === 'geheim') {
      adminFreigabe = true
      alert('✅ Adminrechte freigeschaltet')
      ladeMeldungen()
    } else {
      alert('❌ Falsches Passwort')
    }
  })

  // Formular absenden
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

    // 📧 E-Mail-Benachrichtigung
    emailjs.send('service_635wmwu', 'template_yzgxwx6', {
      artikelname,
      restbestand,
      melder
    })
    .then(() => console.log('📧 E-Mail versendet'))
    .catch(err => console.error('❌ E-Mail-Fehler:', err))

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
    const statusZelle = document.createElement('td')
    const dropdown = createStatusDropdown(m.id, m.status)

    statusZelle.appendChild(dropdown)
    row.innerHTML = `
      <td>${m.artikelname}</td>
      <td>${m.restbestand}</td>
      <td>${m.melder}</td>
    `
    row.appendChild(statusZelle)
    tbody.appendChild(row)
  })
}

function createStatusDropdown(id, currentStatus) {
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

  if (!adminFreigabe) {
    select.disabled = true
    select.title = 'Statusänderung nur mit Adminfreigabe möglich'
  }

  select.addEventListener('change', async () => {
    if (!adminFreigabe) return

    const neuerStatus = select.value
    const { error } = await supabase.from('meldungen')
      .update({
        status: neuerStatus,
        status_zeit: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      alert('❌ Fehler beim Status-Update')
      console.error(error)
    } else {
      console.log('✅ Status geändert:', neuerStatus)
      ladeMeldungen()
    }
  })

  return select
}
