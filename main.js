import { supabase } from './supabaseClient.js'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('meldung-form')
  const feedback = document.getElementById('meldung-feedback')
  const adminPass = 'geheim' // 👈 dein Adminpasswort

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
    !(m.status === 'geliefert' && m.status_zeit < siebenTageZurueck)
  )

  sichtbare.forEach(m => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${m.artikelname}</td>
      <td>${m.restbestand}</td>
      <td>${m.melder}</td>
      <td>
        <span class="badge">${m.status ?? '-'}</span>
        <button class="status-btn" data-id="${m.id}" data-status="${m.status}">⟳</button>
      </td>
    `
    tbody.appendChild(row)
  })

  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const eingabePasswort = passInput.value.trim()
      if (eingabePasswort !== 'geheim') {
        alert('❌ Falsches Passwort')
        return
      }

      const id = btn.getAttribute('data-id')
      const aktuellerStatus = btn.getAttribute('data-status')
      const naechsterStatus = getNextStatus(aktuellerStatus)
      if (!naechsterStatus) return alert('✅ Status ist bereits „geliefert“')

      const { error } = await supabase.from('meldungen')
        .update({ status: naechsterStatus, status_zeit: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('❌ Fehler beim Update:', error)
      } else {
        ladeMeldungen()
      }
    })
  })
}

function getNextStatus(status) {
  const stufen = ['gemeldet', 'angefragt', 'bestellt', 'geliefert']
  const idx = stufen.indexOf(status)
  return idx >= 0 && idx < stufen.length - 1 ? stufen[idx + 1] : null
}
