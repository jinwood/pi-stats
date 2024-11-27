import "./App.css";
import pieLogo from "./assets/pie.svg";
import SystemMonitor from "./SystemMonitor";

function App() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold mb-4">Raspberry Pi System Monitor</h1>
        <img src={pieLogo} className="logo react" alt="React logo" />
      </div>
      <SystemMonitor />
    </>
  );
}

export default App;
