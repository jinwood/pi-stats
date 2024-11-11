<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface CpuInfo {
  usage_percent: number
  frequency: number | null
  temperature: number | null
  cores: number
}

interface MemoryInfo {
  total: number
  available: number
  percent_used: number
}

interface DiskInfo {
  total: number
  used: number
  free: number
  percent_used: number
}

interface NetworkInfo {
  bytes_sent: number
  bytes_recv: number
}

interface SystemInfo {
  cpu: CpuInfo
  memory: MemoryInfo
  disk: DiskInfo
  network: NetworkInfo
}

interface ProcessInfo {
  pid: number
  name: string
  cpu_percent: number
  memory_percent: number
}
const API_BASE_URL = 'http://pi.local:5000'
const systemInfo = ref<SystemInfo | null>(null)
const processes = ref<ProcessInfo[]>([])
const updateInterval = ref<number | null>(null)
const error = ref<string | null>(null)

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  switch (sizes[i]) {
    case 'GB':
      return `${value.toFixed(2)} GB`
    case 'KB':
      return `${Math.round(value)} KB` // 0 dp for KB
    default:
      return `${value.toFixed(1)} ${sizes[i]}` // 1 dp for everything else
  }
}

const fetchData = async (): Promise<void> => {
  try {
    error.value = null
    const [sysResponse, procResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/system`),
      fetch(`${API_BASE_URL}/api/processes`),
    ])

    if (!sysResponse.ok || !procResponse.ok) {
      throw new Error('bad')
    }

    const [sysData, procData] = await Promise.all([
      sysResponse.json() as Promise<SystemInfo>,
      procResponse.json() as Promise<ProcessInfo>,
    ])

    systemInfo.value = sysData
    processes.value = procData
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
    console.error('Error fetching system info:', e)
  }
}

onMounted(() => {
  fetchData()
  updateInterval.value = window.setInterval(fetchData, 3000)
})

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Raspberry Pi System Monitor</h1>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <div v-if="systemInfo" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- CPU Info -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-2">CPU</h2>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span>Usage:</span>
            <span :class="systemInfo.cpu.usage_percent > 80 ? 'text-red-600' : 'text-green-600'">
              {{ formatPercentage(systemInfo.cpu.usage_percent) }}
            </span>
          </div>
          <div class="flex justify-between items-center" v-if="systemInfo.cpu.temperature">
            <span>Temperature:</span>
            <span :class="systemInfo.cpu.temperature > 70 ? 'text-red-600' : 'text-green-600'">
              {{ systemInfo.cpu.temperature.toFixed(1) }}°C
            </span>
          </div>
          <div class="flex justify-between items-center" v-if="systemInfo.cpu.frequency">
            <span>Frequency:</span>
            <span>{{ (systemInfo.cpu.frequency / 1000).toFixed(2) }} GHz</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Cores:</span>
            <span>{{ systemInfo.cpu.cores }}</span>
          </div>
        </div>
      </div>

      <!-- Memory Info -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-2">Memory</h2>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span>Total:</span>
            <span>{{ formatBytes(systemInfo.memory.total) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Available:</span>
            <span>{{ formatBytes(systemInfo.memory.available) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Used:</span>
            <span :class="systemInfo.memory.percent_used > 90 ? 'text-red-600' : 'text-green-600'">
              {{ formatPercentage(systemInfo.memory.percent_used) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Disk Info -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-2">Disk</h2>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span>Total:</span>
            <span>{{ formatBytes(systemInfo.disk.total) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Used:</span>
            <span>{{ formatBytes(systemInfo.disk.used) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Free:</span>
            <span>{{ formatBytes(systemInfo.disk.free) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Used:</span>
            <span :class="systemInfo.disk.percent_used > 90 ? 'text-red-600' : 'text-green-600'">
              {{ formatPercentage(systemInfo.disk.percent_used) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Network Info -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-2">Network</h2>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span>Sent:</span>
            <span>{{ formatBytes(systemInfo.network.bytes_sent) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Received:</span>
            <span>{{ formatBytes(systemInfo.network.bytes_recv) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Process List -->
    <div v-if="processes.length" class="mt-6">
      <h2 class="text-xl font-semibold mb-2">Top Processes</h2>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-50">
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                CPU %
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Memory %
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="process in processes" :key="process.pid">
              <td class="px-6 py-4 whitespace-nowrap">{{ process.pid }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ process.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="process.cpu_percent > 50 ? 'text-red-600' : 'text-green-600'">
                  {{ process.cpu_percent.toFixed(1) }}%
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="process.memory_percent > 50 ? 'text-red-600' : 'text-green-600'">
                  {{ process.memory_percent.toFixed(1) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
