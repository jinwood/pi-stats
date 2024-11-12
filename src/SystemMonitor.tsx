import { useState, useEffect } from "react";

interface CpuInfo {
  usage_percent: number;
  frequency: number | null;
  temperature: number | null;
  cores: number;
}

interface MemoryInfo {
  total: number;
  available: number;
  percent_used: number;
}

interface DiskInfo {
  total: number;
  used: number;
  free: number;
  percent_used: number;
}

interface NetworkInfo {
  bytes_sent: number;
  bytes_recv: number;
}

interface SystemInfo {
  cpu: CpuInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  network: NetworkInfo;
}

interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_percent: number;
}

const API_BASE_URL = "http://pi.local:5000";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  switch (sizes[i]) {
    case "GB":
      return `${value.toFixed(2)} GB`;
    case "KB":
      return `${Math.round(value)} KB`;
    default:
      return `${value.toFixed(1)} ${sizes[i]}`;
  }
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const SystemMonitor = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [sysResponse, procResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/system`),
          fetch(`${API_BASE_URL}/api/processes`),
        ]);

        if (!sysResponse.ok || !procResponse.ok) {
          throw new Error("Network response was not ok");
        }

        const [sysData, procData] = await Promise.all([
          sysResponse.json() as Promise<SystemInfo>,
          procResponse.json() as Promise<ProcessInfo[]>,
        ]);

        setSystemInfo(sysData);
        setProcesses(procData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred");
        console.error("Error fetching system info:", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (!systemInfo) {
    return <div className="p-4">Loading system information...</div>;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">CPU</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Usage:</span>
              <span
                className={
                  systemInfo.cpu.usage_percent > 80
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {formatPercentage(systemInfo.cpu.usage_percent)}
              </span>
            </div>
            {systemInfo.cpu.temperature && (
              <div className="flex justify-between items-center">
                <span>Temperature:</span>
                <span
                  className={
                    systemInfo.cpu.temperature > 70
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {systemInfo.cpu.temperature.toFixed(1)}°C
                </span>
              </div>
            )}
            {systemInfo.cpu.frequency && (
              <div className="flex justify-between items-center">
                <span>Frequency:</span>
                <span>{(systemInfo.cpu.frequency / 1000).toFixed(2)} GHz</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Cores:</span>
              <span>{systemInfo.cpu.cores}</span>
            </div>
          </div>
        </div>

        {/* Memory Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Memory</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Total:</span>
              <span>{formatBytes(systemInfo.memory.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Available:</span>
              <span>{formatBytes(systemInfo.memory.available)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Used:</span>
              <span
                className={
                  systemInfo.memory.percent_used > 90
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {formatPercentage(systemInfo.memory.percent_used)}
              </span>
            </div>
          </div>
        </div>

        {/* Disk Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Disk</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Total:</span>
              <span>{formatBytes(systemInfo.disk.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Used:</span>
              <span>{formatBytes(systemInfo.disk.used)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Free:</span>
              <span>{formatBytes(systemInfo.disk.free)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Used:</span>
              <span
                className={
                  systemInfo.disk.percent_used > 90
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {formatPercentage(systemInfo.disk.percent_used)}
              </span>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Network</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Sent:</span>
              <span>{formatBytes(systemInfo.network.bytes_sent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Received:</span>
              <span>{formatBytes(systemInfo.network.bytes_recv)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Process List */}
      {processes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Top Processes</h2>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPU %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Memory %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processes.map((process) => (
                  <tr key={process.pid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {process.pid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {process.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={
                          process.cpu_percent > 50
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {formatPercentage(process.cpu_percent)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={
                          process.memory_percent > 50
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {formatPercentage(process.memory_percent)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitor;
