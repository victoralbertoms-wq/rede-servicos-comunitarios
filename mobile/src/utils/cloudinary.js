const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

/**
 * Faz upload de uma URI local (expo-image-picker) para o Cloudinary.
 * Retorna a URL segura (https) da imagem.
 *
 * @param {string} uri - URI local retornada pelo ImagePicker
 * @param {string} folder - Pasta no Cloudinary (ex: 'services', 'users')
 * @returns {Promise<string>} URL pública da imagem
 */
export async function uploadToCloudinary(uri, folder = 'geral') {
  if (!uri) return ''

  const filename = uri.split('/').pop()
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  const mimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  const type = mimeTypes[ext] || 'image/jpeg'

  const formData = new FormData()
  formData.append('file', { uri, name: filename, type })
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', `rede-servicos/${folder}`)

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' },
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Erro ao enviar imagem.')
  }

  const data = await response.json()
  return data.secure_url
}
