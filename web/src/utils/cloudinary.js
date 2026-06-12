const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

/**
 * Faz upload de um File para o Cloudinary usando upload não-assinado.
 * Retorna a URL segura (https) da imagem.
 *
 * @param {File} file - Objeto File do input
 * @param {string} folder - Pasta no Cloudinary (ex: 'services', 'users')
 * @returns {Promise<string>} URL pública da imagem
 */
export async function uploadToCloudinary(file, folder = 'geral') {
  if (!file) return ''

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', `rede-servicos/${folder}`)

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Erro ao enviar imagem.')
  }

  const data = await response.json()
  return data.secure_url
}
