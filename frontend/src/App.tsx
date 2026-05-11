import Desktop from './components/Desktop'
import Taskbar from './components/Taskbar'
import Window from './components/Window'
import { useOSStore } from './store/osStore'

function App() {
  const { windows } = useOSStore()

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Desktop />
      {windows.map(win => (
        <Window key={win.id} window={win} />
      ))}
      <Taskbar />
    </div>
  )
}

export default App