import { createRoot } from 'react-dom/client'
import Modal from 'react-modal'
import './index.css'
import App from './App.tsx'

// React Modal 앱 엘리먼트 설정
Modal.setAppElement('#root')

createRoot(document.getElementById('root')!).render(
    <App />
)
