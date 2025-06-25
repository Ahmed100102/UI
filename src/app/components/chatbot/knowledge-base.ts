export interface KnowledgeEntry {
  category: string;
  message: string;
  keywords: string[];
  response: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    category: 'General',
    message: 'How to install Geneos and its components',
    keywords: ['install', 'installation', 'geneos', 'netprobe', 'gateway', 'components', 'setup'],
    response: '➡ To install Geneos, start by downloading the Netprobe and Gateway binaries from the ITRS portal. Configure an XML file for each component, then run them from the command line. Make sure the ports are open and each process is properly connected.'
  },
  {
    category: 'Netprobe',
    message: 'Netprobe not connecting to Gateway',
    keywords: ['netprobe', 'connection', 'gateway', 'port', '7036', 'firewall'],
    response: '➡ Check that port 7036 is open, the Gateway IP address is correct, and the firewall is not blocking communication.'
  },
  {
    category: 'Netprobe',
    message: 'Netprobe crashed unexpectedly',
    keywords: ['crash', 'netprobe', 'core', 'memory', 'segfault'],
    response: '➡ Check the `netprobe.log` file, review scripts and available memory. Analyze any recently added custom plugin.'
  },
  {
    category: 'Netprobe',
    message: 'Netprobe log file not rotating',
    keywords: ['log', 'rotate', 'netprobe', 'logfile', 'size'],
    response: '➡ Check the `rotateSize` and `maxBackupFiles` settings. The directory must be writable.'
  },
  {
    category: 'Netprobe',
    message: 'Permission denied during script execution',
    keywords: ['permission', 'denied', 'script', 'access', 'chmod'],
    response: '➡ Check the permissions of the called scripts and run Netprobe with a user account that has sufficient rights.'
  },
  {
    category: 'Gateway',
    message: 'Gateway not starting due to port conflict',
    keywords: ['gateway', 'port', 'conflict', 'already in use'],
    response: '➡ The port is already in use. Change it in the XML or use `lsof`/`netstat` to identify the conflict.'
  },
  {
    category: 'Gateway',
    message: 'Gateway configuration file invalid',
    keywords: ['gateway', 'xml', 'invalid', 'config'],
    response: '➡ Check that the XML file follows the expected structure. Use an XML validator.'
  },
  {
    category: 'Gateway',
    message: 'Too many Netprobes connected',
    keywords: ['gateway', 'too many', 'netprobe', 'limit'],
    response: '➡ The number of Netprobes exceeds the defined limit. Increase capacity or distribute the load.'
  },
  {
    category: 'Configuration',
    message: 'Invalid XML structure',
    keywords: ['xml', 'invalid', 'syntax', 'config'],
    response: '➡ Use an XML editor with validation to fix the invalid structure.'
  },
  {
    category: 'Configuration',
    message: 'Environment variable not defined',
    keywords: ['env', 'variable', 'undefined', 'not found'],
    response: '➡ Check `.bashrc`, `.profile`, or startup scripts to declare the variable.'
  },
  {
    category: 'Plugin',
    message: 'Plugin not found',
    keywords: ['plugin', 'missing', 'not found', 'library', '.so', '.dll'],
    response: '➡ Make sure the plugin file is present and correctly declared in the XML configuration.'
  },
  {
    category: 'Plugin',
    message: 'Sampling failure in plugin',
    keywords: ['sampling', 'plugin', 'failure', 'error', 'execution'],
    response: '➡ Check the commands called by the plugin and enable debug mode for more details.'
  },
  {
    category: 'Command',
    message: 'Command execution timeout',
    keywords: ['timeout', 'command', 'plugin', 'script'],
    response: '➡ The script takes too long. Optimize it or increase the `commandTimeout` in the plugin configuration.'
  },
  {
    category: 'Command',
    message: 'Command not found',
    keywords: ['command', 'not found', 'missing', 'executable'],
    response: '➡ Check the full path of the command and the PATH environment variables.'
  },
  {
    category: 'General',
    message: 'How to install Netprobe',
    keywords: ['install', 'netprobe', 'installation'],
    response: '➡ Download Netprobe from the ITRS portal, extract it, and configure a basic XML before running.'
  },
  {
    category: 'General',
    message: 'Where to find Netprobe logs',
    keywords: ['log', 'netprobe', 'location', 'file'],
    response: '➡ By default, `netprobe.log` is located in the directory where Netprobe is launched.'
  },
  {
    category: 'General',
    message: 'Difference between Gateway and Netprobe',
    keywords: ['difference', 'gateway', 'netprobe'],
    response: '➡ Netprobe collects data on a server, and Gateway centralizes and analyzes this data to trigger alerts.'
  },
  {
    category: 'General',
    message: 'How to start a Gateway',
    keywords: ['start', 'gateway', 'launch'],
    response: '➡ Use `./gateway` or the appropriate binary with the XML file as an argument.'
  },
  {
    category: 'General',
    message: 'Is it possible to run multiple Netprobes',
    keywords: ['multiple', 'netprobes', 'multi', 'instances'],
    response: '➡ Yes, as long as each Netprobe uses a different port and is connected to an authorized Gateway.'
  },
  {
    category: 'General',
    message: 'Is Geneos compatible with Windows',
    keywords: ['windows', 'geneos', 'compatibility'],
    response: '➡ Yes, Geneos works on Linux, Windows, and Solaris, depending on the components used.'
  },
  {
    category: 'General',
    message: 'Best practices for monitoring',
    keywords: ['best practices', 'monitoring', 'tips'],
    response: '➡ Monitor only what is critical, use clear thresholds, document each alert, and test alerts regularly.'
  },
  {
    category: 'General',
    message: 'What to do if the console is slow',
    keywords: ['console', 'slow', 'lag'],
    response: '➡ Reduce complex rules, clean logs, check memory load, and disable unnecessary views.'
  },
  {
    category: 'General',
    message: 'How to update a plugin',
    keywords: ['update', 'plugin'],
    response: '➡ Replace the plugin file and restart Netprobe to reload the new version.'
  },
  {
    category: 'General',
    message: 'Typical structure of a Geneos XML',
    keywords: ['structure', 'xml', 'geneos'],
    response: '➡ A typical XML file contains a `<gateway>` or `<netprobe>` root with sections for plugins, samplers, rules, etc.'
  }
];
