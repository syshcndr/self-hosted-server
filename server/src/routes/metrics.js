const { Router } = require('express');
const si = require('systeminformation');
const fs = require('fs');
const os = require('os');

const router = Router();

// Read real host memory from /host/proc/meminfo
function getHostMemory() {
  try {
    const meminfo = fs.readFileSync('/host/proc/meminfo', 'utf8');
    const getValue = (key) => {
      const match = meminfo.match(new RegExp(`${key}:\\s+(\\d+)`));
      return match ? parseInt(match[1]) * 1024 : 0; // convert KB to bytes
    };
    const total = getValue('MemTotal');
    const free = getValue('MemFree');
    const available = getValue('MemAvailable');
    const buffers = getValue('Buffers');
    const cached = getValue('Cached');
    const used = total - free - buffers - cached;
    const swapTotal = getValue('SwapTotal');
    const swapFree = getValue('SwapFree');
    return {
      total, used, free, available,
      usedPercent: Math.round((used / total) * 10000) / 100,
      swap: { total: swapTotal, used: swapTotal - swapFree, free: swapFree },
    };
  } catch {
    return null;
  }
}

// Read host uptime from /host/proc/uptime
function getHostUptime() {
  try {
    const data = fs.readFileSync('/host/proc/uptime', 'utf8');
    return parseFloat(data.split(' ')[0]);
  } catch {
    return os.uptime();
  }
}

router.get('/', async (req, res) => {
  try {
    const [cpu, cpuTemp, mem, disk, os, load, net, time] = await Promise.all([
      si.cpu(),
      si.cpuTemperature(),
      si.mem(),
      si.fsSize(),
      si.osInfo(),
      si.currentLoad(),
      si.networkStats(),
      si.time(),
    ]);

    // Use real host memory if available
    const hostMem = getHostMemory();
    const memData = hostMem || {
      total: mem.total, used: mem.used, free: mem.free,
      available: mem.available,
      usedPercent: Math.round((mem.used / mem.total) * 10000) / 100,
      swap: { total: mem.swaptotal, used: mem.swapused, free: mem.swapfree },
    };

    res.json({
      system: {
        hostname: os.hostname,
        platform: os.platform,
        distro: os.distro,
        arch: os.arch,
        kernel: os.kernel,
        uptime: getHostUptime(),
      },
      cpu: {
        model: cpu.brand,
        manufacturer: cpu.manufacturer,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: `${cpu.speed} GHz`,
        loadPercent: Math.round(load.currentLoad * 100) / 100,
        temperature: cpuTemp.main !== null ? `${cpuTemp.main}°C` : 'N/A',
        coresTemp: cpuTemp.cores.length ? cpuTemp.cores.map(t => `${t}°C`) : 'N/A',
      },
      memory: {
        total: formatBytes(memData.total),
        used: formatBytes(memData.used),
        free: formatBytes(memData.free),
        available: formatBytes(memData.available),
        usedPercent: memData.usedPercent,
        swap: {
          total: formatBytes(memData.swap.total),
          used: formatBytes(memData.swap.used),
          free: formatBytes(memData.swap.free),
        },
      },
      disk: disk.map(d => ({
        fs: d.fs,
        type: d.type,
        mount: d.mount,
        size: formatBytes(d.size),
        used: formatBytes(d.used),
        available: formatBytes(d.available),
        usedPercent: Math.round(d.use * 100) / 100,
      })),
      network: net.map(n => ({
        interface: n.iface,
        rxBytes: formatBytes(n.rx_bytes),
        txBytes: formatBytes(n.tx_bytes),
        rxPerSec: formatBytes(n.rx_sec) + '/s',
        txPerSec: formatBytes(n.tx_sec) + '/s',
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system metrics', details: err.message });
  }
});

function formatBytes(bytes) {
  if (bytes === 0 || bytes === null) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

module.exports = router;
