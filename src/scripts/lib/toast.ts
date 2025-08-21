document.body.insertAdjacentHTML('beforeend', `
    <div id="toast-container"></div>
`)

export function showToast (message: string, type: 'error' | 'info' = 'error', duration: number = 5000): void {
  const toast = document.createElement('div')
  toast.className = 'toast ' + type
  toast.textContent = message
  document.getElementById('toast-container')?.appendChild(toast)
  setTimeout(() => {
    toast.remove()
  }, duration)
}
